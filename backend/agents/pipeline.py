"""
Casper Claims — Multi-Agent Pipeline
Agents: Classifier → Researcher → Legal Writer → Strength Scorer → Casper Logger
"""

import os
import json
import hashlib
import httpx
from datetime import datetime
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CSPR_CLOUD_API_KEY = os.getenv("CSPR_CLOUD_API_KEY", "")
CSPR_CLOUD_BASE = "https://api.cspr.cloud"

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.3,
)


# ── State ──────────────────────────────────────────────────────────────────────

class ClaimState(TypedDict):
    complaint_text: str
    company_name: str
    claim_type: str          # insurance / bank / landlord / airline / telecom / other
    jurisdiction: str        # US / UK / EU / IN / other
    classification: dict
    research: str
    response_letter: str
    case_strength: int       # 0-100
    case_summary: str
    on_chain_hash: str
    on_chain_tx: str
    error: str


# ── Helpers ────────────────────────────────────────────────────────────────────

def call_llm(system: str, user: str) -> str:
    messages = [SystemMessage(content=system), HumanMessage(content=user)]
    return llm.invoke(messages).content.strip()


# ── Agent 1: Classifier ────────────────────────────────────────────────────────

def classifier_agent(state: ClaimState) -> ClaimState:
    system = """You are a claims classification expert. 
Analyze the complaint and return ONLY valid JSON with these fields:
{
  "claim_type": one of [insurance, bank, landlord, airline, telecom, ecommerce, other],
  "company_name": string (extract from text or use "Unknown Company"),
  "jurisdiction": one of [US, UK, EU, IN, AU, other],
  "issue_summary": string (one sentence),
  "key_facts": [list of 3-5 key facts from the complaint],
  "urgency": one of [low, medium, high]
}
Return ONLY the JSON, no markdown, no explanation."""

    user = f"Classify this complaint:\n\n{state['complaint_text']}"

    try:
        raw = call_llm(system, user)
        clean = raw.replace("```json", "").replace("```", "").strip()
        classification = json.loads(clean)
    except Exception:
        classification = {
            "claim_type": state.get("claim_type", "other"),
            "company_name": state.get("company_name", "Unknown Company"),
            "jurisdiction": state.get("jurisdiction", "US"),
            "issue_summary": "Unable to classify automatically.",
            "key_facts": [],
            "urgency": "medium",
        }

    return {**state, "classification": classification,
            "claim_type": classification["claim_type"],
            "company_name": classification["company_name"],
            "jurisdiction": classification["jurisdiction"]}


# ── Agent 2: Researcher ────────────────────────────────────────────────────────

def researcher_agent(state: ClaimState) -> ClaimState:
    c = state["classification"]
    system = """You are a consumer rights legal researcher.
Given a claim type and jurisdiction, provide:
1. The most relevant consumer protection laws and regulations
2. Specific statutes or codes the company may have violated
3. Precedent cases or regulatory guidance
4. Time limits for filing complaints (statutes of limitation)
5. Regulatory bodies the consumer can escalate to
Be specific, cite real laws, and be concise."""

    user = f"""Claim type: {c.get('claim_type', 'other')}
Jurisdiction: {c.get('jurisdiction', 'US')}
Company type: {c.get('claim_type', 'other')}
Issue: {c.get('issue_summary', '')}
Key facts: {', '.join(c.get('key_facts', []))}

Provide relevant legal research for drafting a strong response letter."""

    research = call_llm(system, user)
    return {**state, "research": research}


# ── Agent 3: Legal Writer ──────────────────────────────────────────────────────

def legal_writer_agent(state: ClaimState) -> ClaimState:
    c = state["classification"]
    system = """You are an expert consumer rights attorney drafting formal response letters.
Write a professional, firm, legally-grounded letter that:
- Opens with a clear statement of the dispute and demands
- References specific laws and regulations (from the research provided)
- States a clear deadline for resolution (14 days standard)
- Lists consequences of non-compliance (regulatory complaints, legal action)
- Closes with a specific demand for remedy
Use formal legal letter format. Be firm but professional. DO NOT be aggressive or emotional.
Format: Full letter ready to send, starting with date and addresses."""

    user = f"""Original complaint:
{state['complaint_text']}

Classification:
- Claim type: {c.get('claim_type')}
- Company: {c.get('company_name')}
- Jurisdiction: {c.get('jurisdiction')}
- Key facts: {', '.join(c.get('key_facts', []))}

Legal research:
{state['research']}

Draft a complete, ready-to-send response letter."""

    letter = call_llm(system, user)
    return {**state, "response_letter": letter}


# ── Agent 4: Strength Scorer ───────────────────────────────────────────────────

def scorer_agent(state: ClaimState) -> ClaimState:
    system = """You are a legal case evaluator. 
Analyze a consumer complaint and response letter, then return ONLY valid JSON:
{
  "score": integer 0-100,
  "verdict": one of [Weak, Fair, Strong, Very Strong],
  "summary": string (2-3 sentences explaining the score),
  "win_factors": [list of 2-3 things working in their favor],
  "risk_factors": [list of 1-2 risks or weaknesses],
  "recommended_next_steps": [list of 2-3 actions]
}
Return ONLY JSON, no markdown."""

    user = f"""Original complaint: {state['complaint_text'][:500]}
Claim type: {state['claim_type']}
Jurisdiction: {state['jurisdiction']}
Response letter excerpt: {state['response_letter'][:800]}

Score the strength of this case."""

    try:
        raw = call_llm(system, user)
        clean = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean)
        score = int(result.get("score", 50))
        summary = result.get("summary", "")
    except Exception:
        result = {
            "score": 50,
            "verdict": "Fair",
            "summary": "Unable to evaluate automatically.",
            "win_factors": [],
            "risk_factors": [],
            "recommended_next_steps": ["Send the drafted letter", "Keep records of all communication"],
        }
        score = 50
        summary = result["summary"]

    return {**state, "case_strength": score, "case_summary": json.dumps(result)}


# ── Agent 5: Casper Logger ─────────────────────────────────────────────────────

def casper_logger_agent(state: ClaimState) -> dict:
    """
    Prepares the final case hash for the frontend to sign and deploy 
    using the Casper Wallet browser extension.
    """
    import hashlib
    from datetime import datetime

    # 1. Safely pull data from your current pipeline state
    company = state.get("company_name", "Unknown")
    claim_type = state.get("claim_type", "other")
    jurisdiction = state.get("jurisdiction", "US")
    strength = state.get("case_strength", 0)
    timestamp = datetime.utcnow().isoformat()

    # 2. Build the unique record and calculate the SHA-256 hash
    data_to_hash = f"{company}:{claim_type}:{jurisdiction}:{strength}:{timestamp}"
    full_hash = hashlib.sha256(data_to_hash.encode("utf-8")).hexdigest()

    print(f"[Casper Logger] Generated Case Hash for UI signing: {full_hash}")

    # 3. Return the payload to pass down into your frontend
    return {
        "on_chain_hash": full_hash,
        "on_chain_tx": "PENDING_WALLET_SIGNATURE"
    }


# ── Graph ──────────────────────────────────────────────────────────────────────

def build_pipeline() -> StateGraph:
    graph = StateGraph(ClaimState)

    graph.add_node("classifier", classifier_agent)
    graph.add_node("researcher", researcher_agent)
    graph.add_node("legal_writer", legal_writer_agent)
    graph.add_node("scorer", scorer_agent)
    graph.add_node("casper_logger", casper_logger_agent)

    graph.set_entry_point("classifier")
    graph.add_edge("classifier", "researcher")
    graph.add_edge("researcher", "legal_writer")
    graph.add_edge("legal_writer", "scorer")
    graph.add_edge("scorer", "casper_logger")
    graph.add_edge("casper_logger", END)

    return graph.compile()


pipeline = build_pipeline()


def run_claim(complaint_text: str) -> dict:
    initial_state: ClaimState = {
        "complaint_text": complaint_text,
        "company_name": "",
        "claim_type": "other",
        "jurisdiction": "US",
        "classification": {},
        "research": "",
        "response_letter": "",
        "case_strength": 0,
        "case_summary": "",
        "on_chain_hash": "",
        "on_chain_tx": "",
        "error": "",
    }

    result = pipeline.invoke(initial_state)

    # Parse case_summary JSON safely
    try:
        score_data = json.loads(result["case_summary"])
    except Exception:
        score_data = {"score": result["case_strength"], "verdict": "Fair",
                      "summary": result["case_summary"], "win_factors": [],
                      "risk_factors": [], "recommended_next_steps": []}

    return {
        "company_name": result["company_name"],
        "claim_type": result["claim_type"],
        "jurisdiction": result["jurisdiction"],
        "classification": result["classification"],
        "research": result["research"],
        "response_letter": result["response_letter"],
        "case_strength": result["case_strength"],
        "score_data": score_data,
        "on_chain_hash": result["on_chain_hash"],
        "on_chain_tx": result["on_chain_tx"],
    }
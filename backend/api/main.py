"""
Casper Claims — FastAPI Backend
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.pipeline import run_claim
import httpx

app = FastAPI(title="Casper Claims API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClaimRequest(BaseModel):
    complaint_text: str


class PublicCaseRecord(BaseModel):
    on_chain_hash: str
    company_name: str
    claim_type: str
    jurisdiction: str
    case_strength: int


# In-memory ledger (replace with DB in production)
public_ledger: list[PublicCaseRecord] = []


@app.get("/")
def root():
    return {"status": "Casper Claims API is running"}


@app.post("/api/analyze")
async def analyze_claim(req: ClaimRequest):
    if not req.complaint_text or len(req.complaint_text.strip()) < 30:
        raise HTTPException(status_code=400, detail="Please provide a more detailed complaint (at least 30 characters).")

    if len(req.complaint_text) > 5000:
        raise HTTPException(status_code=400, detail="Complaint too long. Please keep it under 5000 characters.")

    try:
        result = run_claim(req.complaint_text)

        # Add to public ledger
        public_ledger.append(PublicCaseRecord(
            on_chain_hash=result["on_chain_hash"],
            company_name=result["company_name"],
            claim_type=result["claim_type"],
            jurisdiction=result["jurisdiction"],
            case_strength=result["case_strength"],
        ))
        # Keep last 100
        if len(public_ledger) > 100:
            public_ledger.pop(0)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent pipeline error: {str(e)}")


@app.get("/api/ledger")
def get_ledger():
    """Public accountability ledger — recent cases logged on Casper"""
    return {"cases": [c.dict() for c in reversed(public_ledger[-20:])]}


@app.get("/api/stats")
def get_stats():
    total = len(public_ledger)
    avg_strength = (
        sum(c.case_strength for c in public_ledger) / total if total else 0
    )
    claim_types = {}
    for c in public_ledger:
        claim_types[c.claim_type] = claim_types.get(c.claim_type, 0) + 1

    return {
        "total_cases": total,
        "avg_case_strength": round(avg_strength, 1),
        "claim_types": claim_types,
    }
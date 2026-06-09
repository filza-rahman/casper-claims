# Casper Claims — AI Consumer Rights Agent

> *They said no. We fight back.*

**Casper Agentic Buildathon 2026 submission** — Built on Casper Network.

Casper Claims is an autonomous multi-agent AI system that fights corporate claim denials. Paste any rejection letter from an insurance company, bank, airline, or landlord — and five AI agents analyze your case, draft a legally-grounded response, and log the outcome permanently on the Casper blockchain as a public accountability record.

---

## Demo

**Live app:** `https://casper-claims.vercel.app`  
**Demo video:** `[to be added]`  
**Casper Testnet deploys:** `[to be added]`

---

## The 5-Agent Pipeline

```
Complaint Text
     │
     ▼
┌──────────────┐
│  Classifier  │  Identifies claim type, company, jurisdiction, key facts
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Researcher  │  Finds applicable consumer protection laws & regulations
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Legal Writer │  Drafts a formal, legally-grounded response letter
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Scorer    │  Evaluates case strength 0-100, verdict, next steps
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Casper Logger │  Hashes case + logs immutably to Casper Testnet
└──────────────┘
```

**Orchestration:** LangGraph (StateGraph)  
**LLM:** Google Gemini 1.5 Flash  
**Blockchain:** Casper Testnet via CSPR.cloud REST API

---

## Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Next.js UI    │──────▶│  FastAPI Backend  │──────▶│  LangGraph   │
│  (Vercel)       │◀──────│  (Railway)        │       │  Pipeline    │
└─────────────────┘       └────────┬─────────┘       └──────┬───────┘
                                   │                         │
                                   ▼                         ▼
                          ┌──────────────────┐      ┌───────────────┐
                          │  Casper Testnet  │      │  Gemini API   │
                          │  (CSPR.cloud)    │      │  (LLM calls)  │
                          └──────────────────┘      └───────────────┘
```

---

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY and CSPR_CLOUD_API_KEY to .env
uvicorn api.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Create .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open `http://localhost:3000`

---

## Deployment

### Backend → Railway
1. Push `backend/` to GitHub
2. Connect to Railway → set env vars: `GEMINI_API_KEY`, `CSPR_CLOUD_API_KEY`
3. Railway auto-detects `Procfile` and runs `uvicorn`

### Frontend → Vercel
1. Push `frontend/` to GitHub  
2. Connect to Vercel → set `NEXT_PUBLIC_API_URL` to your Railway URL
3. Deploy

---

## Casper Integration

Every case processed by the agent pipeline:

1. **Hashed** — SHA-256 of `{company, claim_type, jurisdiction, strength, timestamp}`
2. **Logged** — Posted to Casper Testnet via CSPR.cloud API
3. **Public** — Visible in the in-app Public Ledger and on CSPR.cloud explorer

The Casper blockchain provides **immutable, tamper-proof accountability records** — making it impossible for companies to deny patterns of unjust claim rejections.

### Why Casper?
- **Upgradable contracts** — the accountability oracle can evolve
- **Predictable gas** — agents can budget transactions reliably  
- **x402 micropayments** — future: pay-per-lookup for the public ledger API
- **MCP Native** — direct blockchain access for AI agents

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Deployment | Vercel (frontend), Railway (backend) |
| Agent Orchestration | LangGraph (StateGraph) |
| LLM | Google Gemini 1.5 Flash |
| Backend API | FastAPI (Python) |
| Blockchain | Casper Testnet via CSPR.cloud REST API |
| On-chain proof | SHA-256 case hashing + CSPR.cloud deploy |

---

## Real-World Impact

**The problem:** Every year, millions of legitimate insurance claims, refund requests, and consumer disputes are denied unfairly. Most people don't have the legal knowledge or resources to fight back.

**Casper Claims democratizes access to consumer justice** — giving anyone the power to generate a legally-grounded response in 30 seconds, backed by an immutable blockchain record.

**The accountability layer:** Over time, the public ledger becomes a searchable record of which companies deny the most claims — creating social and regulatory pressure through radical transparency.

---

## License

MIT — open source for the Casper ecosystem.

---

*Built with ❤️ for the Casper Agentic Buildathon 2026*

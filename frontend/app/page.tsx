"use client"

import { useState } from "react"
import Hero from "@/components/Hero"
import ClaimForm from "@/components/ClaimForm"
import AgentProgress from "@/components/AgentProgress"
import ResultsPanel from "@/components/ResultsPanel"
import PublicLedger from "@/components/PublicLedger"
import HowItWorks from "@/components/HowItWorks"

export type ClaimResult = {
  company_name: string
  claim_type: string
  jurisdiction: string
  classification: Record<string, any>
  research: string
  response_letter: string
  case_strength: number
  score_data: {
    score: number
    verdict: string
    summary: string
    win_factors: string[]
    risk_factors: string[]
    recommended_next_steps: string[]
  }
  on_chain_hash: string
  on_chain_tx: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const AGENT_STEPS = [
  { id: "classifier", label: "Classifying your claim",      icon: "🔍" },
  { id: "researcher", label: "Researching applicable laws", icon: "⚖️" },
  { id: "writer",     label: "Drafting response letter",    icon: "✍️" },
  { id: "scorer",     label: "Evaluating case strength",    icon: "📊" },
  { id: "casper",     label: "Logging to Casper blockchain",icon: "🔗" },
]

export default function Home() {
  const [loading, setLoading]     = useState(false)
  const [step, setStep]           = useState(-1)
  const [result, setResult]       = useState<ClaimResult | null>(null)
  const [error, setError]         = useState("")

  async function handleSubmit(complaint: string) {
    setLoading(true)
    setResult(null)
    setError("")
    setStep(0)

    // Simulate agent progress steps during real API call
    const stepInterval = setInterval(() => {
      setStep(s => (s < AGENT_STEPS.length - 1 ? s + 1 : s))
    }, 3200)

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_text: complaint }),
      })

      clearInterval(stepInterval)

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Something went wrong.")
      }

      setStep(AGENT_STEPS.length - 1)
      await new Promise(r => setTimeout(r, 600))

      const data: ClaimResult = await res.json()
      setResult(data)
    } catch (e: any) {
      clearInterval(stepInterval)
      setError(e.message || "Failed to process your claim. Please try again.")
    } finally {
      setLoading(false)
      setStep(-1)
    }
  }

  function handleReset() {
    setResult(null)
    setError("")
    setStep(-1)
  }

  return (
    <main className="relative min-h-screen bg-ink overflow-x-hidden">

      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232,51,74,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,51,74,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow top-center */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center top, rgba(232,51,74,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <Hero />

        <section id="submit" className="max-w-3xl mx-auto px-4 pb-16">
          {!result && !loading && (
            <ClaimForm onSubmit={handleSubmit} error={error} />
          )}

          {loading && (
            <AgentProgress steps={AGENT_STEPS} currentStep={step} />
          )}

          {result && (
            <ResultsPanel result={result} onReset={handleReset} />
          )}
        </section>

        <HowItWorks />
        <PublicLedger />

        <footer className="border-t border-border py-8 text-center text-dim text-sm font-body">
          <p>
            Built on{" "}
            <a href="https://casper.network" target="_blank" rel="noopener noreferrer"
               className="text-casper hover:text-red transition-colors">
              Casper Network
            </a>
            {" "}· Casper Agentic Buildathon 2026
          </p>
          <p className="mt-1 text-muted text-xs">
            Every case is hashed and logged immutably on Casper Testnet.
            No legal advice — use for informational purposes only.
          </p>
        </footer>
      </div>
    </main>
  )
}
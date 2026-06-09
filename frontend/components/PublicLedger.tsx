"use client"

import { useEffect, useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface CaseRecord {
  on_chain_hash: string
  company_name: string
  claim_type: string
  jurisdiction: string
  case_strength: number
}

const TYPE_EMOJI: Record<string, string> = {
  insurance: "🏥", bank: "🏦", landlord: "🏠",
  airline: "✈️", telecom: "📡", ecommerce: "🛒", other: "📋",
}

export default function PublicLedger() {
  const [cases, setCases]   = useState<CaseRecord[]>([])
  const [stats, setStats]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [ledgerRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/api/ledger`),
          fetch(`${API_URL}/api/stats`),
        ])
        if (ledgerRes.ok) {
          const d = await ledgerRes.json()
          setCases(d.cases || [])
        }
        if (statsRes.ok) {
          const s = await statsRes.json()
          setStats(s)
        }
      } catch { /* backend not running yet */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return null

  return (
    <section className="max-w-4xl mx-auto px-4 py-16 border-t border-border">
      <div className="text-center mb-10">
        <p className="text-xs font-mono text-dim uppercase tracking-widest mb-3">Public Ledger</p>
        <h2 className="font-display text-3xl text-snow mb-2">
          The accountability record
        </h2>
        <p className="text-dim font-body text-sm max-w-lg mx-auto">
          Every case processed is hashed and logged on Casper Testnet — a permanent,
          tamper-proof record of which companies deny legitimate claims.
        </p>
      </div>

      {/* Stats */}
      {stats && stats.total_cases > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Cases filed",    value: stats.total_cases },
            { label: "Avg strength",   value: `${stats.avg_case_strength}%` },
            { label: "Claim types",    value: Object.keys(stats.claim_types).length },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="font-display text-2xl text-snow">{s.value}</div>
              <div className="font-body text-xs text-dim mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Cases */}
      {cases.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <p className="text-dim font-body text-sm">
            No cases logged yet. Submit your first claim above to start the ledger.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:border-border/80 transition-all"
            >
              <span className="text-xl flex-shrink-0">{TYPE_EMOJI[c.claim_type] || "📋"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-light font-medium truncate">{c.company_name}</p>
                <p className="font-mono text-xs text-muted truncate">{c.on_chain_hash.slice(0, 32)}…</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`font-body text-sm font-semibold ${
                  c.case_strength >= 70 ? "text-green" :
                  c.case_strength >= 45 ? "text-amber" : "text-casper"
                }`}>
                  {c.case_strength}%
                </div>
                <div className="font-body text-xs text-dim">{c.jurisdiction}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
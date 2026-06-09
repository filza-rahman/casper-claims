"use client"

export default function Hero() {
  return (
    <header className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 border border-redDim bg-redDim/40 rounded-full px-4 py-1.5 mb-8">
        <span className="w-2 h-2 rounded-full bg-casper border-pulse" />
        <span className="text-xs font-mono text-casper tracking-widest uppercase">
          Casper Agentic Buildathon 2026
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-snow leading-[1.05] mb-6">
        They said{" "}
        <span
          className="italic text-casper glow-text"
          style={{ fontStyle: "italic" }}
        >
          no.
        </span>
        <br />
        We fight back.
      </h1>

      <p className="font-body text-lg sm:text-xl text-dim max-w-2xl mx-auto mb-10 leading-relaxed">
        Paste the letter from your insurance company, bank, airline, or landlord.
        Five AI agents analyze your case, draft a legally-grounded response, and
        log the outcome permanently on the{" "}
        <span className="text-light">Casper blockchain</span> as a public
        accountability record.
      </p>

      {/* CTA */}
      <a
        href="#submit"
        className="inline-flex items-center gap-3 bg-casper hover:bg-red text-white font-body font-medium px-8 py-4 rounded-full transition-all duration-200 hover:scale-105 glow-red text-base"
      >
        <span>Fight Your Claim</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-8 mt-14 pt-10 border-t border-border">
        {[
          { label: "AI Agents",          value: "5"    },
          { label: "Laws Referenced",    value: "100+" },
          { label: "On-chain Records",   value: "∞"    },
          { label: "Cost to You",        value: "$0"   },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl text-snow">{s.value}</div>
            <div className="font-body text-xs text-dim mt-1 tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>
    </header>
  )
}
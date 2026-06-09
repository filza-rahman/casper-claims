"use client"

const STEPS = [
  {
    n: "01",
    title: "Paste your letter",
    body: "Drop in any rejection, denial, or refusal letter — from insurance companies, banks, airlines, landlords, or telecoms.",
    icon: "📄",
  },
  {
    n: "02",
    title: "5 agents go to work",
    body: "A Classifier, Legal Researcher, Letter Writer, Case Scorer, and Blockchain Logger work in sequence using LangGraph on Casper.",
    icon: "🤖",
  },
  {
    n: "03",
    title: "Get your response",
    body: "Receive a legally-grounded response letter citing real consumer protection laws, regulations, and your right to escalate.",
    icon: "⚖️",
  },
  {
    n: "04",
    title: "Case goes on-chain",
    body: "A cryptographic hash of your case is logged permanently on the Casper blockchain — building a public record of corporate accountability.",
    icon: "🔗",
  },
]

export default function HowItWorks() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-20 border-t border-border">
      <div className="text-center mb-12">
        <p className="text-xs font-mono text-dim uppercase tracking-widest mb-3">How it works</p>
        <h2 className="font-display text-3xl sm:text-4xl text-snow">
          From complaint to counter-attack in 30 seconds
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STEPS.map(step => (
          <div
            key={step.n}
            className="group p-6 rounded-2xl border border-border bg-surface hover:border-casper/40 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl flex-shrink-0">{step.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-casper">{step.n}</span>
                  <h3 className="font-body font-semibold text-light text-sm">{step.title}</h3>
                </div>
                <p className="font-body text-sm text-dim leading-relaxed">{step.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
"use client"

import { useState } from "react"

const EXAMPLES = [
  {
    label: "Insurance denial",
    text: `Dear Policyholder,

After reviewing your claim #CLM-2024-88291 for water damage to your property at 123 Main Street, we have determined that your claim does not meet the criteria for coverage under your homeowner's policy. The damage appears to be the result of gradual water infiltration, which is excluded under Section 4.2(b) of your policy terms.

We are therefore denying your claim for $12,400 in repairs.

Sincerely,
Claims Department
SafeGuard Insurance Co.`,
  },
  {
    label: "Airline refund refusal",
    text: `Dear Passenger,

Thank you for contacting us regarding flight AA2291 from New York to London, which was cancelled on March 14, 2024. As per our terms and conditions, we are offering you a travel voucher valid for 12 months as compensation for the cancellation.

We are unable to provide a cash refund as the cancellation was due to extraordinary circumstances beyond our control (weather conditions). Your voucher of $780 has been issued to your account.

Blue Sky Airlines Customer Service`,
  },
  {
    label: "Bank charge dispute",
    text: `Dear Customer,

We have reviewed your dispute regarding the $35 overdraft fee charged on April 2, 2024. After investigation, we have determined that the fee was correctly applied in accordance with our fee schedule, as your account balance fell below zero by $12.47.

As a one-time courtesy we have previously waived a fee on your account in 2023. We are unable to waive this fee again.

Regards,
First National Bank — Customer Relations`,
  },
]

interface Props {
  onSubmit: (complaint: string) => void
  error: string
}

export default function ClaimForm({ onSubmit, error }: Props) {
  const [text, setText] = useState("")
  const [charCount, setCharCount] = useState(0)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    setCharCount(e.target.value.length)
  }

  function loadExample(example: typeof EXAMPLES[0]) {
    setText(example.text)
    setCharCount(example.text.length)
  }

  function handleSubmit() {
    if (text.trim().length >= 30) onSubmit(text.trim())
  }

  const ready = text.trim().length >= 30

  return (
    <div className="step-in">
      {/* Example pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-dim font-body pt-1">Try an example:</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => loadExample(ex)}
            className="text-xs font-body border border-border text-dim hover:border-casper hover:text-casper px-3 py-1 rounded-full transition-all duration-150"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div
        className="relative rounded-2xl border border-border bg-panel overflow-hidden transition-all duration-300"
        style={ready ? { borderColor: "rgba(232,51,74,0.4)", boxShadow: "0 0 30px rgba(232,51,74,0.08)" } : {}}
      >
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Paste the rejection or refusal letter here — from your insurance company, bank, airline, landlord, or any institution that wronged you..."
          rows={12}
          maxLength={5000}
          className="w-full bg-transparent text-light font-body text-sm leading-relaxed p-6 resize-none outline-none placeholder:text-muted"
        />

        <div className="flex items-center justify-between px-6 py-3 border-t border-border">
          <span className="text-xs font-mono text-muted">
            {charCount} / 5000 chars
            {charCount >= 30 && (
              <span className="text-green ml-2">✓ ready</span>
            )}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!ready}
            className={`flex items-center gap-2 font-body font-medium text-sm px-6 py-2.5 rounded-full transition-all duration-200 ${
              ready
                ? "bg-casper text-white hover:bg-red hover:scale-105 glow-red"
                : "bg-surface text-muted cursor-not-allowed border border-border"
            }`}
          >
            <span>Analyze & Fight</span>
            {ready && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-redDim border border-casper/30 text-sm font-body text-casper step-in">
          {error}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-muted font-body">
        Your complaint is processed anonymously. Only a cryptographic hash is stored on-chain — never your full text.
      </p>
    </div>
  )
}
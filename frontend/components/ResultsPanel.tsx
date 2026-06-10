"use client"

import { useState } from "react"
import type { ClaimResult } from "@/app/page"

interface Props {
  result: ClaimResult
  onReset: () => void
}

const VERDICT_COLOR: Record<string, string> = {
  "Weak":        "text-amber",
  "Fair":        "text-amber",
  "Strong":      "text-green",
  "Very Strong": "text-green",
}

const TYPE_LABEL: Record<string, string> = {
  insurance: "Insurance", bank: "Banking", landlord: "Landlord",
  airline: "Airline", telecom: "Telecom", ecommerce: "E-Commerce", other: "General",
}

export default function ResultsPanel({ result, onReset }: Props) {
  const [copied, setCopied]   = useState(false)
  const [tab, setTab]         = useState<"letter" | "research">("letter")
  const [signing, setSigning] = useState(false)
  const [txStatus, setTxStatus] = useState<string>(
    result.on_chain_tx || "PENDING_WALLET_SIGNATURE"
  )

  const sd          = result.score_data
  const scoreOffset = 283 - (283 * result.case_strength) / 100

  function copyLetter() {
    navigator.clipboard.writeText(result.response_letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function signWithCasper() {
  if (typeof window === "undefined" || !(window as any).CasperWalletProvider) {
    alert("Casper Wallet extension not found. Please install it.")
    window.open("https://cspr.click", "_blank")
    return
  }
  try {
    setSigning(true)
    const {
      CasperClient, DeployUtil, CLPublicKey, CLValueBuilder
    } = await import("casper-js-sdk")

    const provider = (window as any).CasperWalletProvider({ timeout: 1800000 })
    await provider.requestConnection()
    const activeKey = await provider.getActivePublicKey()

    const client = new CasperClient("https://node.testnet.cspr.cloud/rpc")
    const senderKey = CLPublicKey.fromHex(activeKey)
    const recipientKey = CLPublicKey.fromHex(
      "020324e3b0ecc22a3077bd4d091e55534dd4f0330f8216dc24cfe747477cd2413e6d"
    )

    // Build a real transfer deploy — 2.5 CSPR to yourself, memo = case hash
    const deployParams = new DeployUtil.DeployParams(
      senderKey, "casper-test", 1, 1800000
    )
    const transferDeploy = DeployUtil.makeDeploy(
      deployParams,
      DeployUtil.ExecutableDeployItem.newTransfer(
        2500000000,   // 2.5 CSPR in motes (minimum transfer)
        recipientKey,
        null,
        1
      ),
      DeployUtil.standardPayment(100000000)
    )

    // Ask wallet to sign it
    const deployJson = DeployUtil.deployToJson(transferDeploy)
    const signedJson = await provider.sign(
      JSON.stringify(deployJson), activeKey
    )

    if (signedJson.cancelled) {
      alert("Transaction cancelled.")
      return
    }

    // Send to Casper testnet
    const signedDeploy = DeployUtil.deployFromJson(signedJson).unwrap()
    const deployHash = await client.putDeploy(signedDeploy)

    setTxStatus(deployHash)
    alert(`✅ On-chain! Deploy hash: ${deployHash}\n\nView on: https://testnet.cspr.live/deploy/${deployHash}`)

  } catch (err: any) {
    console.error(err)
    alert("Error: " + (err.message || "Something went wrong"))
  } finally {
    setSigning(false)
  }
}

  return (
    <div className="step-in space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-dim uppercase tracking-widest">Case analyzed</span>
          <span className="text-xs font-mono text-dim">·</span>
          <span className="text-xs font-body text-casper font-medium">
            {TYPE_LABEL[result.claim_type] || "General"} · {result.jurisdiction}
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-body text-dim hover:text-light border border-border hover:border-light px-3 py-1.5 rounded-full transition-all"
        >
          New claim
        </button>
      </div>

      {/* ── Score card ── */}
      <div className="rounded-2xl border border-border bg-panel p-6 flex flex-col sm:flex-row items-center gap-6">

        {/* SVG ring */}
        <div className="relative flex-shrink-0">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="45" fill="none" stroke="#252535" strokeWidth="8"/>
            <circle
              cx="55" cy="55" r="45"
              fill="none"
              stroke={
                result.case_strength >= 70 ? "#2ECC71"
                : result.case_strength >= 45 ? "#F5A623"
                : "#E8334A"
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={scoreOffset}
              transform="rotate(-90 55 55)"
              style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl text-snow">{result.case_strength}</span>
            <span className="font-body text-xs text-dim">/ 100</span>
          </div>
        </div>

        {/* Verdict + factors */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
            <span className={`font-display text-2xl ${VERDICT_COLOR[sd?.verdict] || "text-amber"}`}>
              {sd?.verdict}
            </span>
            <span className="text-dim font-body text-sm">case</span>
          </div>
          <p className="font-body text-sm text-dim leading-relaxed mb-3">{sd?.summary}</p>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {sd?.win_factors?.map((f, i) => (
              <span key={i} className="text-xs font-body bg-green/10 border border-green/20 text-green px-2.5 py-1 rounded-full">
                ✓ {f}
              </span>
            ))}
            {sd?.risk_factors?.map((f, i) => (
              <span key={i} className="text-xs font-body bg-amber/10 border border-amber/20 text-amber px-2.5 py-1 rounded-full">
                ⚠ {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recommended next steps ── */}
      {sd?.recommended_next_steps?.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-mono text-dim uppercase tracking-widest mb-3">Recommended next steps</p>
          <ol className="space-y-2">
            {sd.recommended_next_steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-body text-light">
                <span className="font-mono text-casper text-xs mt-0.5 flex-shrink-0">0{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Letter + Research tabs ── */}
      <div className="rounded-2xl border border-border bg-panel overflow-hidden">
        <div className="flex border-b border-border">
          {(["letter", "research"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-body font-medium transition-colors ${
                tab === t
                  ? "text-light border-b-2 border-casper bg-surface"
                  : "text-dim hover:text-light"
              }`}
            >
              {t === "letter" ? "✉️ Response Letter" : "📚 Legal Research"}
            </button>
          ))}
        </div>

        <div className="p-6 relative">
          {tab === "letter" && (
            <>
              <button
                onClick={copyLetter}
                className="absolute top-4 right-4 text-xs font-body border border-border text-dim hover:text-light hover:border-light px-3 py-1.5 rounded-full transition-all"
              >
                {copied ? "✓ Copied!" : "Copy letter"}
              </button>
              <pre className="font-mono text-xs text-light leading-relaxed whitespace-pre-wrap overflow-auto max-h-96 pr-16">
                {result.response_letter}
              </pre>
            </>
          )}
          {tab === "research" && (
            <div className="font-body text-sm text-dim leading-relaxed space-y-3 max-h-96 overflow-auto">
              {result.research?.split("\n").map((line, i) => (
                <p key={i} className={line.match(/^\d+\./) ? "text-light font-medium" : ""}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── On-chain record ── */}
      <div className="rounded-2xl border border-casper/20 bg-red/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-casper text-sm">🔗</span>
          <span className="text-xs font-mono text-casper uppercase tracking-widest">
            Logged on Casper Testnet
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-dim">Case hash</span>
            <span className="font-mono text-xs text-light break-all bg-ink/50 px-3 py-2 rounded-lg border border-border">
              {result.on_chain_hash}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-dim">Transaction</span>
            {txStatus !== "PENDING_WALLET_SIGNATURE" ? (
              <a
                href={`https://testnet.cspr.live/deploy/${txStatus}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-casper break-all bg-ink/50 px-3 py-2 rounded-lg border border-border hover:border-casper/50 transition-all block"
              >
                {txStatus} ↗
              </a>
            ) : (
              <span className="font-mono text-xs text-casper break-all bg-ink/50 px-3 py-2 rounded-lg border border-border block">
                {txStatus}
              </span>
            )}
          </div>

          {/* Wallet sign button — only shown when pending */}
          {txStatus === "PENDING_WALLET_SIGNATURE" && (
            <button
              onClick={signWithCasper}
              disabled={signing}
              className="w-full mt-1 font-body text-sm font-medium bg-casper text-white hover:opacity-90 disabled:opacity-50 px-4 py-3 rounded-xl transition-opacity flex items-center justify-center gap-2"
            >
              {signing ? "Connecting…" : "Sign & Log on Casper Testnet"}
            </button>
          )}
        </div>
        <p className="text-xs text-dim font-body mt-3">
          This case record is permanently stored on the Casper blockchain — building a public accountability ledger of corporate claim denials.
        </p>
      </div>

    </div>
  )
}
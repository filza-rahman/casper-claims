"use client"

import { useEffect, useState } from "react"

interface Step {
  id: string
  label: string
  icon: string
}

interface Props {
  steps: Step[]
  currentStep: number
}

export default function AgentProgress({ steps, currentStep }: Props) {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "." : d + ".")
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="step-in py-8">
      <div className="text-center mb-10">
        <p className="font-display text-2xl text-snow mb-2">
          Agents working{dots}
        </p>
        <p className="text-sm font-body text-dim">
          Five AI agents are analyzing your case in sequence
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const isDone    = i < currentStep
          const isActive  = i === currentStep
          const isPending = i > currentStep

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                isActive  ? "border-casper/50 bg-redDim/30 glow-red"    :
                isDone    ? "border-green/30 bg-green/5"                :
                            "border-border bg-surface opacity-40"
              }`}
            >
              {/* Status indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-300 ${
                isDone   ? "bg-green/20 border border-green/50"         :
                isActive ? "bg-redDim border border-casper/60"          :
                           "bg-surface border border-border"
              }`}>
                {isDone   ? <span className="text-green text-xs">✓</span> :
                 isActive ? <span className="animate-spin text-casper text-xs">◌</span> :
                            <span className="text-muted text-xs">{i + 1}</span>}
              </div>

              {/* Icon + label */}
              <span className="text-lg">{step.icon}</span>
              <span className={`font-body text-sm font-medium ${
                isDone ? "text-green" : isActive ? "text-light" : "text-muted"
              }`}>
                {step.label}
                {isActive && <span className="text-dim">{dots}</span>}
              </span>

              {/* Done badge */}
              {isDone && (
                <span className="ml-auto text-xs font-mono text-green/70">done</span>
              )}
              {isActive && (
                <span className="ml-auto text-xs font-mono text-casper/70">running</span>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted font-body mt-8">
        This usually takes 15–30 seconds depending on claim complexity
      </p>
    </div>
  )
}
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Casper Claims — AI Consumer Rights Agent",
  description: "Paste your rejection letter. Our AI agents fight back — and log every case permanently on Casper blockchain as a public accountability record.",
  openGraph: {
    title: "Casper Claims — AI Consumer Rights Agent",
    description: "Paste your rejection letter. Our AI fights back.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
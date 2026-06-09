import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette — matched to your globals.css and component usage
        ink:    "#0A0A0F",   // page background
        panel:  "#111118",   // card backgrounds
        surface:"#16161F",   // slightly lighter surface (next-steps, tab active)
        border: "#252535",   // all borders
        dim:    "#6B6B85",   // muted/secondary text
        light:  "#B8B8CC",   // primary body text
        snow:   "#E8E8F0",   // brightest text (score number)

        // Accent colours
        casper: "#FF473A",   // Casper red — used for labels, links, on-chain section
        green:  "#2ECC71",   // win factors, strong verdict
        amber:  "#F5A623",   // risk factors, fair verdict
        red:    "#E8334A",   // weak verdict, glow effects
        redDim: "#E8334A",   // used as bg-redDim/20 in on-chain card
      },
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "serif"],
        body:    ["'Inter'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "step-in": "stepIn 0.4s ease forwards",
      },
      keyframes: {
        stepIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
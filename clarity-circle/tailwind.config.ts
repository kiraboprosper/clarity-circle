import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lavender scale
        lavender: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        // Cherry blossom / blush scale
        blossom: {
          50:  "#fff1f5",
          100: "#ffe4ed",
          200: "#fecdd9",
          300: "#fda4be",
          400: "#fb7ba1",
          500: "#f43f7f",
          600: "#e11d62",
          700: "#be1253",
          800: "#9d1247",
          900: "#84123f",
        },
        // Sage green for balance, health, and garden growth
        sage: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        // Warm achievement gold
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Inclusive connection accent
        coral: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        // Deep purple for dark mode
        midnight: {
          50:  "#f0eeff",
          100: "#e3dfff",
          200: "#ccc4ff",
          300: "#ab9cff",
          400: "#8870ff",
          500: "#6a4fff",
          600: "#5733f5",
          700: "#4a26e0",
          800: "#3d1fb8",
          900: "#1a0a4a",
          950: "#0d0520",
        },
        // Neutral warm whites
        pearl: {
          50:  "#fdfcff",
          100: "#f9f7ff",
          200: "#f3f0ff",
          300: "#ebe6ff",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft:  "0 2px 16px 0 rgba(22, 163, 74, 0.08)",
        card:  "0 4px 24px 0 rgba(76, 29, 149, 0.10)",
        glow:  "0 0 24px 4px rgba(196, 181, 253, 0.35)",
        bloom: "0 4px 32px 0 rgba(245, 158, 11, 0.18)",
      },
      animation: {
        "fade-in":    "fadeIn 0.4s ease-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "bloom":      "bloom 3s ease-in-out infinite",
        "float":      "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:     { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:    { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        bloom:      { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.05)" } },
        float:      { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        pulseSoft:  { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
      },
    },
  },
  plugins: [],
};

export default config;

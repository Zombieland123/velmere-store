import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "velmere-black": "#030303",
        "velmere-graphite": "#0A0A0A",
        "velmere-charcoal": "#111111",
        "velmere-slate": "#1A1A1A",
        "velmere-panel": "#111111",
        "velmere-ivory": "#F5F0E8",
        "velmere-offwhite": "#FAF7F0",
        "velmere-grey-soft": "#D8D5CF",
        "velmere-gold": "#C8A96A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "\"Times New Roman\"", "serif"],
        mono: ["var(--font-mono)", "\"JetBrains Mono\"", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

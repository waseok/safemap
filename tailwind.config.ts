import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Gong Gothic"', "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-text-primary)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        safe: { DEFAULT: "var(--color-safe)", soft: "var(--color-safe-soft)" },
        caution: { DEFAULT: "var(--color-caution)", soft: "var(--color-caution-soft)" },
        danger: { DEFAULT: "var(--color-danger)", soft: "var(--color-danger-soft)" },
        info: { DEFAULT: "var(--color-info)", soft: "var(--color-info-soft)" },
      },
      borderRadius: {
        card: "1rem",
        panel: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;

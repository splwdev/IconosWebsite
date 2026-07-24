import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

// Colours and fonts are NOT hardcoded here. They resolve to CSS variables
// that src/lib/theme writes onto <html> at request time, based on whichever
// theme row is currently published (or being previewed by an admin).
// This is what makes the admin "switch theme" feature work without a rebuild.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "var(--color-dark)",
          darker: "var(--color-darker)",
          cream: "var(--color-cream)",
          tint: "var(--color-tint)",
          accent: "var(--color-accent)",
          "accent-soft": "var(--color-accent-soft)",
        },
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      borderRadius: {
        brand: "var(--radius-brand)",
      },
    },
  },
  plugins: [typography],
};

export default config;

import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

// Colours and fonts are NOT hardcoded here. They resolve to CSS variables
// that src/lib/theme writes onto <html> at request time, based on whichever
// theme row is currently published (or being previewed by an admin).
// This is what makes the admin "switch theme" feature work without a rebuild.
//
// The variables hold hex values, so Tailwind can't apply opacity modifiers
// (`text-brand-dark/75`) to them directly — those classes silently fell back
// to full-strength colour. color-mix() with Tailwind's <alpha-value>
// placeholder makes the modifiers work; with no modifier, alpha is 1 and the
// colour is unchanged.
const themeColor = (cssVar: string) =>
  `color-mix(in srgb, var(${cssVar}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: themeColor("--color-dark"),
          darker: themeColor("--color-darker"),
          cream: themeColor("--color-cream"),
          // --color-tint is never set by css-vars.ts; fall back to cream.
          tint: themeColor("--color-tint, var(--color-cream)"),
          accent: themeColor("--color-accent"),
          "accent-soft": themeColor("--color-accent-soft"),
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

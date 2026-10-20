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
      // Theme type scale (admin → Themes → Font sizes). Each var is a fluid
      // clamp() written by src/lib/theme/css-vars.ts. Use these on public
      // pages instead of fixed sizes (text-xl, text-[15px]) so the theme
      // controls them.
      fontSize: {
        h1: ["var(--text-h1)", { lineHeight: "1.1" }],
        h2: ["var(--text-h2)", { lineHeight: "1.2" }],
        h3: ["var(--text-h3)", { lineHeight: "1.3" }],
        h4: ["var(--text-h4)", { lineHeight: "1.4" }],
        body: ["var(--text-body)", { lineHeight: "1.65" }],
        small: ["var(--text-small)", { lineHeight: "1.55" }],
        // Intro paragraphs under a page or section title.
        lead: ["calc(var(--text-body) * 1.125)", { lineHeight: "1.6" }],
      },
      borderRadius: {
        brand: "var(--radius-brand)",
      },
    },
  },
  plugins: [typography],
};

export default config;

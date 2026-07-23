import type { ThemeTokens } from "./types";

const RADIUS_MAP: Record<ThemeTokens["radius"], string> = {
  pill: "999px",
  rounded: "12px",
  square: "2px",
};

/**
 * Produces the CSS custom properties Tailwind reads (see tailwind.config.ts
 * `colors.brand.*` / `fontFamily.display|body` / `borderRadius.brand`).
 * Rendered once into a <style> tag in the root layout — no client JS needed
 * for the theme to apply, so it works even with JS disabled.
 */
export function themeToCssVariables(tokens: ThemeTokens): string {
  const { colors } = tokens;
  return `:root{
    --color-dark:${colors.dark};
    --color-darker:${colors.darker};
    --color-accent:${colors.accent};
    --color-accent-soft:${colors.accent_soft};
    --color-cream:${colors.cream};
    --color-white:${colors.white};
    --font-display:'${tokens.font_display}', sans-serif;
    --font-body:'${tokens.font_body}', sans-serif;
    --radius-brand:${RADIUS_MAP[tokens.radius]};
  }`;
}

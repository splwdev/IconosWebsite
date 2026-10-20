import { TYPE_STYLES, type ThemeTokens } from "./types";

const RADIUS_MAP: Record<ThemeTokens["radius"], string> = {
  pill: "999px",
  rounded: "12px",
  square: "2px",
};

/** Viewport widths (px) between which type sizes scale from mobile to desktop. */
export const FLUID_MIN_VIEWPORT = 375;
export const FLUID_MAX_VIEWPORT = 1280;

const round = (n: number) => Math.round(n * 10000) / 10000;

/**
 * A size that is `mobilePx` on small screens, `desktopPx` from 1280px up,
 * and scales smoothly in between. Expressed in rem (not px) so a visitor's
 * browser text-size setting still enlarges it (WCAG 1.4.4).
 */
export function fluidFontSize(mobilePx: number, desktopPx: number): string {
  if (mobilePx === desktopPx) return `${round(mobilePx / 16)}rem`;
  const slope = (desktopPx - mobilePx) / (FLUID_MAX_VIEWPORT - FLUID_MIN_VIEWPORT);
  const interceptRem = round((mobilePx - slope * FLUID_MIN_VIEWPORT) / 16);
  const vw = round(slope * 100);
  return `clamp(${round(mobilePx / 16)}rem, ${interceptRem}rem + ${vw}vw, ${round(desktopPx / 16)}rem)`;
}

/**
 * Produces the CSS custom properties Tailwind reads (see tailwind.config.ts
 * `colors.brand.*` / `fontFamily.display|body` / `borderRadius.brand` /
 * `fontSize.h1…small`). Rendered once into a <style> tag in the root layout
 * — no client JS needed for the theme to apply, so it works even with JS
 * disabled.
 *
 * Only call this with tokens that have been through themeTokensSchema:
 * that's what guarantees every interpolated value is a validated hex,
 * an allow-listed font name or an integer.
 */
export function themeToCssVariables(tokens: ThemeTokens): string {
  const { colors, type_scale } = tokens;
  const sizes = TYPE_STYLES.map(
    (style) => `--text-${style}:${fluidFontSize(type_scale[style].mobile, type_scale[style].desktop)};`
  ).join("");

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
    ${sizes}
  }`;
}

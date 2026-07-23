import type { ThemeTokens } from "./types";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0]! + 0.7152 * srgb[1]! + 0.0722 * srgb[2]!;
}

/** Returns the WCAG contrast ratio between two hex colours (1–21). */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastCheckResult {
  passes: boolean;
  failures: string[];
}

/**
 * Checks the combinations that matter for this design system:
 * body text (dark) on the light backgrounds, and white text on the dark/
 * accent surfaces used for buttons. WCAG AA for normal text requires 4.5:1.
 */
export function checkThemeContrast(tokens: ThemeTokens): ContrastCheckResult {
  const { colors } = tokens;
  const AA_NORMAL_TEXT = 4.5;
  const checks: Array<{ label: string; fg: string; bg: string }> = [
    { label: "Body text on white", fg: colors.dark, bg: colors.white },
    { label: "Body text on cream", fg: colors.dark, bg: colors.cream },
    { label: "Button text on accent", fg: colors.white, bg: colors.accent },
    { label: "Button text on dark", fg: colors.white, bg: colors.dark },
  ];

  const failures = checks
    .filter((c) => contrastRatio(c.fg, c.bg) < AA_NORMAL_TEXT)
    .map((c) => `${c.label} fails WCAG AA (needs ≥ ${AA_NORMAL_TEXT}:1)`);

  return { passes: failures.length === 0, failures };
}

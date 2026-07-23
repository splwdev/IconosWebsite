/**
 * Fonts staff are allowed to choose in the theme editor. Deliberately a
 * closed list, not a free-text field — prevents an admin from pointing the
 * public site at an arbitrary/malicious external stylesheet.
 *
 * Google Fonts CSS variable names must match exactly (spaces preserved).
 */
export const ALLOWED_FONTS = ["Outfit", "Jost", "Host Grotesk"] as const;

export type AllowedFont = (typeof ALLOWED_FONTS)[number];

/** Builds the Google Fonts stylesheet URL for the fonts actually in use. */
export function buildGoogleFontsUrl(fonts: string[]): string {
  const unique = Array.from(new Set(fonts));
  const families = unique
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

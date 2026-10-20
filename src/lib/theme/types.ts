import { z } from "zod";
import { ALLOWED_FONTS } from "./fonts";

const hex = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex colour, e.g. #772035");

// ---------------------------------------------------------------------------
// Type scale
// ---------------------------------------------------------------------------

export const TYPE_STYLES = ["h1", "h2", "h3", "h4", "body", "small"] as const;
export type TypeStyle = (typeof TYPE_STYLES)[number];

export const TYPE_STYLE_LABELS: Record<TypeStyle, { label: string; usedFor: string }> = {
  h1: { label: "Heading 1", usedFor: "Page titles" },
  h2: { label: "Heading 2", usedFor: "Section titles" },
  h3: { label: "Heading 3", usedFor: "Card and column titles" },
  h4: { label: "Heading 4", usedFor: "Sub-headings in rich text" },
  body: { label: "Body", usedFor: "Paragraphs, quotes and rich text" },
  small: { label: "Small", usedFor: "Card descriptions and captions" },
};

/**
 * Min/max px per style. Integers only, so values are safe to interpolate
 * into the <style> tag the layout renders (see css-vars.ts). Body has a 14px
 * floor: smaller running text is hard to read for many visitors.
 */
const SIZE_LIMITS: Record<TypeStyle, { min: number; max: number }> = {
  h1: { min: 20, max: 96 },
  h2: { min: 18, max: 72 },
  h3: { min: 14, max: 48 },
  h4: { min: 14, max: 40 },
  body: { min: 14, max: 24 },
  small: { min: 12, max: 20 },
};

/** Matches the sizes the site used before the scale was configurable. */
export const DEFAULT_TYPE_SCALE: Record<TypeStyle, { mobile: number; desktop: number }> = {
  h1: { mobile: 36, desktop: 48 },
  h2: { mobile: 28, desktop: 36 },
  h3: { mobile: 18, desktop: 20 },
  h4: { mobile: 16, desktop: 18 },
  body: { mobile: 16, desktop: 16 },
  small: { mobile: 14, desktop: 14 },
};

function sizePair(style: TypeStyle) {
  const { min, max } = SIZE_LIMITS[style];
  const px = z
    .number({ invalid_type_error: "Enter a size in px" })
    .int("Whole pixels only")
    .min(min, `At least ${min}px`)
    .max(max, `At most ${max}px`);
  return z
    .object({ mobile: px, desktop: px })
    .refine((v) => v.mobile <= v.desktop, {
      message: "Mobile size can't be larger than desktop",
      path: ["mobile"],
    })
    .default(DEFAULT_TYPE_SCALE[style]);
}

export const typeScaleSchema = z
  .object({
    h1: sizePair("h1"),
    h2: sizePair("h2"),
    h3: sizePair("h3"),
    h4: sizePair("h4"),
    body: sizePair("body"),
    small: sizePair("small"),
  })
  // Themes saved before the type scale existed have no type_scale key.
  .default(DEFAULT_TYPE_SCALE);

export type TypeScale = z.infer<typeof typeScaleSchema>;

export const themeTokensSchema = z.object({
  /** Headings font. */
  font_display: z.enum(ALLOWED_FONTS),
  /** Everything else: body text, buttons, navigation. */
  font_body: z.enum(ALLOWED_FONTS),
  colors: z.object({
    dark: hex,
    darker: hex,
    accent: hex,
    accent_soft: hex,
    cream: hex,
    white: hex,
  }),
  radius: z.enum(["pill", "rounded", "square"]),
  type_scale: typeScaleSchema,
});

export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export type ThemeStatus = "draft" | "published" | "archived";

export interface Theme {
  id: string;
  name: string;
  slug: string;
  status: ThemeStatus;
  tokens: ThemeTokens;
  notes: string | null;
  updated_at: string;
}

/**
 * Non-blocking advice for the editor: a heading smaller than the level
 * below it usually means a typo. Doesn't stop saving.
 */
export function typeScaleWarnings(scale: TypeScale): string[] {
  const order: TypeStyle[] = ["h1", "h2", "h3", "h4", "body"];
  const warnings: string[] = [];
  for (let i = 0; i < order.length - 1; i++) {
    const upper = order[i]!;
    const lower = order[i + 1]!;
    if (scale[upper].desktop < scale[lower].desktop) {
      warnings.push(
        `${TYPE_STYLE_LABELS[upper].label} (${scale[upper].desktop}px) is smaller than ${TYPE_STYLE_LABELS[lower].label} (${scale[lower].desktop}px) on desktop.`
      );
    }
  }
  return warnings;
}

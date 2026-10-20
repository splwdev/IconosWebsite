import { describe, expect, it } from "vitest";
import { FLUID_MAX_VIEWPORT, FLUID_MIN_VIEWPORT, fluidFontSize, themeToCssVariables } from "./css-vars";
import { DEFAULT_TYPE_SCALE, themeTokensSchema, typeScaleWarnings } from "./types";

// Exactly as the three concept themes are stored today: no type_scale key.
const storedConcept1 = {
  font_display: "Outfit",
  font_body: "Outfit",
  colors: {
    dark: "#262323",
    darker: "#111111",
    accent: "#262323",
    accent_soft: "#C4B8AB",
    cream: "#F3F1EE",
    white: "#FFFFFF",
  },
  radius: "pill",
};

/** Evaluates a clamp(min rem, a rem + b vw, max rem) string at a viewport width, in px. */
function evaluate(css: string, viewport: number): number {
  const fixed = css.match(/^([\d.]+)rem$/);
  if (fixed) return Number(fixed[1]) * 16;
  const m = css.match(/^clamp\(([\d.]+)rem, (-?[\d.]+)rem \+ ([\d.]+)vw, ([\d.]+)rem\)$/);
  if (!m) throw new Error(`unexpected format: ${css}`);
  const [min, a, b, max] = m.slice(1).map(Number) as [number, number, number, number];
  const preferred = a * 16 + (b / 100) * viewport;
  return Math.min(Math.max(preferred, min * 16), max * 16);
}

describe("fluidFontSize", () => {
  it("is the mobile size at 375px and the desktop size at 1280px", () => {
    const css = fluidFontSize(36, 48);
    expect(evaluate(css, FLUID_MIN_VIEWPORT)).toBeCloseTo(36, 1);
    expect(evaluate(css, FLUID_MAX_VIEWPORT)).toBeCloseTo(48, 1);
  });

  it("scales between them and stays clamped outside the range", () => {
    const css = fluidFontSize(28, 36);
    const mid = evaluate(css, (FLUID_MIN_VIEWPORT + FLUID_MAX_VIEWPORT) / 2);
    expect(mid).toBeGreaterThan(28);
    expect(mid).toBeLessThan(36);
    expect(evaluate(css, 320)).toBeCloseTo(28, 1);
    expect(evaluate(css, 1920)).toBeCloseTo(36, 1);
  });

  it("uses a plain rem value when mobile and desktop match", () => {
    expect(fluidFontSize(16, 16)).toBe("1rem");
  });
});

describe("themeTokensSchema type_scale", () => {
  it("gives existing themes (saved before font sizes existed) today's sizes", () => {
    const parsed = themeTokensSchema.parse(storedConcept1);
    expect(parsed.type_scale).toEqual(DEFAULT_TYPE_SCALE);
  });

  it("fills a missing style without touching the ones that were set", () => {
    const parsed = themeTokensSchema.parse({ ...storedConcept1, type_scale: { h1: { mobile: 40, desktop: 56 } } });
    expect(parsed.type_scale.h1).toEqual({ mobile: 40, desktop: 56 });
    expect(parsed.type_scale.h2).toEqual(DEFAULT_TYPE_SCALE.h2);
  });

  it.each([
    ["mobile larger than desktop", { mobile: 50, desktop: 40 }],
    ["non-integer", { mobile: 36.5, desktop: 48 }],
    ["above the maximum", { mobile: 36, desktop: 200 }],
    ["a string (CSS injection attempt)", { mobile: "1px;}body{display:none", desktop: 48 }],
  ])("rejects %s", (_label, h1) => {
    expect(themeTokensSchema.safeParse({ ...storedConcept1, type_scale: { h1 } }).success).toBe(false);
  });

  it("keeps body text at 14px or larger", () => {
    const result = themeTokensSchema.safeParse({ ...storedConcept1, type_scale: { body: { mobile: 12, desktop: 16 } } });
    expect(result.success).toBe(false);
  });
});

describe("themeToCssVariables", () => {
  it("writes a size variable for every style", () => {
    const css = themeToCssVariables(themeTokensSchema.parse(storedConcept1));
    for (const style of ["h1", "h2", "h3", "h4", "body", "small"]) {
      expect(css).toMatch(new RegExp(`--text-${style}:(clamp\\(|[\\d.]+rem)`));
    }
    expect(css).toContain("--font-body:'Outfit'");
  });
});

describe("typeScaleWarnings", () => {
  it("is quiet for the defaults", () => {
    expect(typeScaleWarnings(DEFAULT_TYPE_SCALE)).toEqual([]);
  });

  it("flags a heading smaller than the level below it", () => {
    const warnings = typeScaleWarnings({ ...DEFAULT_TYPE_SCALE, h2: { mobile: 18, desktop: 18 } });
    expect(warnings.join(" ")).toContain("Heading 2 (18px) is smaller than Heading 3 (20px)");
  });
});

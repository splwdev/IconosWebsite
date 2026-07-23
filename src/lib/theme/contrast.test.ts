import { describe, it, expect } from "vitest";
import { contrastRatio, checkThemeContrast } from "./contrast";
import type { ThemeTokens } from "./types";

describe("contrastRatio", () => {
  it("returns 21 for pure black on pure white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  });

  it("returns 1 for identical colours", () => {
    expect(contrastRatio("#772035", "#772035")).toBeCloseTo(1, 5);
  });

  it("is symmetric regardless of argument order", () => {
    const a = contrastRatio("#262323", "#F3F1EE");
    const b = contrastRatio("#F3F1EE", "#262323");
    expect(a).toBeCloseTo(b, 5);
  });
});

describe("checkThemeContrast", () => {
  const baseTokens: ThemeTokens = {
    font_display: "Outfit",
    font_body: "Outfit",
    radius: "pill",
    colors: {
      dark: "#262323",
      darker: "#111111",
      accent: "#772035",
      accent_soft: "#e7cfd5",
      cream: "#F3F1EE",
      white: "#FFFFFF",
    },
  };

  it("passes for the concept-2 (burgundy) palette", () => {
    const result = checkThemeContrast(baseTokens);
    expect(result.passes).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it("fails when accent is too close to white for button text", () => {
    const badTokens: ThemeTokens = {
      ...baseTokens,
      colors: { ...baseTokens.colors, accent: "#F5F0EA" }, // near-white accent
    };
    const result = checkThemeContrast(badTokens);
    expect(result.passes).toBe(false);
    expect(result.failures.some((f) => f.includes("accent"))).toBe(true);
  });
});

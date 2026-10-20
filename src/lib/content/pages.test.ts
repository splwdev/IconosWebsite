import { describe, expect, it } from "vitest";
import { getPagePublicPath, isSingletonPage, pageInputSchema, type PageInput } from "./pages";

const overview: PageInput = {
  page_type: "overview",
  parent_section: null,
  slug: "how-we-work",
  title: "Fixed fees. No surprise invoices.",
  tag: "How we work",
  summary: "Our subscriptions offer one predictable monthly cost.",
  intro: null,
  body: "",
  tiers: null,
  meta_description: null,
  featured_image_url: null,
  featured_image_alt: null,
  sort_order: 0,
  show_in_nav: false,
};

describe("overview pages", () => {
  it("accept the How We Work overview", () => {
    expect(pageInputSchema.safeParse(overview).success).toBe(true);
  });

  it.each([
    ["an unknown slug", { slug: "pricing" }],
    ["a parent section (would leak into nav dropdowns)", { parent_section: "how-we-work" as const }],
    ["show_in_nav", { show_in_nav: true }],
  ])("reject %s", (_label, change) => {
    expect(pageInputSchema.safeParse({ ...overview, ...change }).success).toBe(false);
  });

  it("are singletons, like the homepage", () => {
    expect(isSingletonPage("overview")).toBe(true);
    expect(isSingletonPage("home")).toBe(true);
    expect(isSingletonPage("program")).toBe(false);
  });
});

describe("getPagePublicPath", () => {
  it.each([
    [{ page_type: "home" as const, parent_section: null, slug: "home" }, "/"],
    [{ page_type: "overview" as const, parent_section: null, slug: "how-we-work" }, "/how-we-work"],
    [{ page_type: "custom" as const, parent_section: null, slug: "careers" }, "/careers"],
    [{ page_type: "program" as const, parent_section: "how-we-work" as const, slug: "ad-hoc-work" }, "/how-we-work/ad-hoc-work"],
  ])("maps %o to %s", (page, path) => {
    expect(getPagePublicPath(page)).toBe(path);
  });
});

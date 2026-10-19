import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SECTION_TYPES,
  createBlankSection,
  isSafeHref,
  pageSectionSchema,
} from "./page-sections";

describe("isSafeHref", () => {
  it.each(["/contact", "/how-we-work/ad-hoc-work", "https://www.sra.org.uk", "mailto:legal@iconos-group.com", "tel:+441234567890"])(
    "accepts %s",
    (href) => expect(isSafeHref(href)).toBe(true)
  );

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "//evil.example.com",
    "http://insecure.example.com",
    "contact",
    "",
  ])("rejects %s", (href) => expect(isSafeHref(href)).toBe(false));
});

describe("pageSectionSchema", () => {
  it("rejects an unsafe CTA link", () => {
    const result = pageSectionSchema.safeParse({
      section_type: "cta",
      background: "none",
      content: { heading: "Hi", body: "", button_label: "Go", button_href: "javascript:alert(1)" },
    });
    expect(result.success).toBe(false);
  });

  it("still parses pre-redesign rows that lack the new optional fields", () => {
    const oldMediaText = pageSectionSchema.safeParse({
      section_type: "media_text",
      background: "tint",
      content: { eyebrow: "Meet the founder", media_type: "video", image_url: null, video_url: "", body: "<p>x</p>", layout: "media-left" },
    });
    const oldTestimonials = pageSectionSchema.safeParse({
      section_type: "testimonials",
      background: "none",
      content: { eyebrow: "Clients", heading: "What our clients say" },
    });
    expect(oldMediaText.success).toBe(true);
    expect(oldTestimonials.success).toBe(true);
  });

  it("trims list items and drops blank lines", () => {
    const parsed = pageSectionSchema.parse({
      section_type: "issues",
      background: "none",
      content: { primary_items: ["  A client who won't pay ", "", "   "], secondary_items: ["A DPA"] },
    });
    if (parsed.section_type !== "issues") throw new Error("wrong type");
    expect(parsed.content.primary_items).toEqual(["A client who won't pay"]);
  });

  it("produces a valid blank for every type that has no required fields", () => {
    // hero and cta need a heading/button before they can be saved, same as
    // before the redesign — the editor shows the validation message.
    const needsInput = new Set(["hero", "cta"]);
    for (const type of SECTION_TYPES) {
      if (needsInput.has(type)) continue;
      expect(pageSectionSchema.safeParse(createBlankSection(type)).success, type).toBe(true);
    }
  });
});

describe("0020_homepage_redesign.sql", () => {
  const sql = readFileSync(
    resolve(process.cwd(), "supabase/migrations/0020_homepage_redesign.sql"),
    "utf8"
  );
  const rows = [...sql.matchAll(/\(v_home_id, '(\w+)', '(\w+)', \$json\$([\s\S]*?)\$json\$::jsonb, (\d+)\)/g)].map(
    ([, section_type, background, json, order]) => ({
      section_type,
      background,
      content: JSON.parse(json ?? "{}"),
      order: Number(order),
    })
  );

  it("seeds the eight sections from the mockup, in order", () => {
    expect(rows.map((r) => r.section_type)).toEqual([
      "hero",
      "services_grid",
      "issues",
      "features",
      "media_text",
      "testimonials",
      "blog_teaser",
      "cta",
    ]);
    expect(rows.map((r) => r.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it.each(["hero", "services_grid", "issues", "features", "media_text", "testimonials", "blog_teaser", "cta"])(
    "%s row passes the application schema (so the renderer won't skip it)",
    (type) => {
      const row = rows.find((r) => r.section_type === type);
      const result = pageSectionSchema.safeParse(row);
      expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    }
  );

  it("allows every application section type in the DB constraint", () => {
    const constraint = sql.match(/check \(section_type in \(([\s\S]*?)\)\)/)?.[1] ?? "";
    for (const type of SECTION_TYPES) {
      expect(constraint).toContain(`'${type}'`);
    }
  });
});

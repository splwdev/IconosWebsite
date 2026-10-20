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

/** Section rows seeded by a migration: `(v_x_id, 'type', 'background', $json$…$json$::jsonb, n)`. */
function seededSections(file: string) {
  const sql = readFileSync(resolve(process.cwd(), "supabase/migrations", file), "utf8");
  const rows = [...sql.matchAll(/\(v_\w+_id, '(\w+)', '(\w+)', \$json\$([\s\S]*?)\$json\$::jsonb, (\d+)\)/g)].map(
    ([, section_type, background, json, order]) => ({
      section_type,
      background,
      content: JSON.parse(json ?? "{}"),
      order: Number(order),
    })
  );
  return { sql, rows };
}

describe("0020_homepage_redesign.sql", () => {
  const { rows } = seededSections("0020_homepage_redesign.sql");

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

  it.each(rows.map((r) => [r.section_type, r] as const))(
    "%s row passes the application schema (so the renderer won't skip it)",
    (_type, row) => {
      const result = pageSectionSchema.safeParse(row);
      expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    }
  );
});

describe("0022_how_we_work_overview.sql", () => {
  const { sql, rows } = seededSections("0022_how_we_work_overview.sql");

  it("seeds the How We Work sections from the mockup, in order", () => {
    expect(rows.map((r) => r.section_type)).toEqual(["programs_highlight", "steps", "cta"]);
    expect(rows.map((r) => r.order)).toEqual([0, 1, 2]);
  });

  it.each(rows.map((r) => [r.section_type, r] as const))(
    "%s row passes the application schema",
    (_type, row) => {
      const result = pageSectionSchema.safeParse(row);
      expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    }
  );

  it("seeds four getting-started steps", () => {
    const steps = rows.find((r) => r.section_type === "steps");
    expect(steps?.content.items.map((i: { title: string }) => i.title)).toEqual([
      "An initial conversation",
      "A clear proposal",
      "We get to work",
      "Ongoing support",
    ]);
  });

  it("is the latest section-type constraint and allows every application section type", () => {
    const constraint = sql.match(/check \(section_type in \(([\s\S]*?)\)\)/)?.[1] ?? "";
    for (const type of SECTION_TYPES) {
      expect(constraint).toContain(`'${type}'`);
    }
  });

  it("only updates program wording that is still the original seeded text", () => {
    const updates = sql.match(/update public\.pages[\s\S]*?;/g) ?? [];
    expect(updates.length).toBeGreaterThan(0);
    for (const u of updates) expect(u).toMatch(/\n\s+and (summary|tag|title) = '/);
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_TESTIMONIAL_COLUMNS, testimonialInputSchema } from "./testimonials-schema";

const base = { quote: "Great team.", attribution: "Ben Stokes", logo_url: null, logo_alt: null, sort_order: 0 };

describe("testimonialInputSchema", () => {
  it("keeps name and role as separate trimmed fields", () => {
    const parsed = testimonialInputSchema.parse({
      ...base,
      attribution: "  Ben Stokes ",
      role: " Director and Co-founder, Elite Consultancy Group ",
    });
    expect(parsed.attribution).toBe("Ben Stokes");
    expect(parsed.role).toBe("Director and Co-founder, Elite Consultancy Group");
  });

  it("treats role as optional", () => {
    expect(testimonialInputSchema.parse(base).role).toBe("");
  });

  it("requires a name, and whitespace alone doesn't count", () => {
    const result = testimonialInputSchema.safeParse({ ...base, attribution: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Name is required");
  });
});

describe("0021_add_role_to_testimonials.sql", () => {
  const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/0021_add_role_to_testimonials.sql"), "utf8");

  it("adds every column the public site selects", () => {
    expect(PUBLIC_TESTIMONIAL_COLUMNS.split(",").map((c) => c.trim())).toContain("role");
    expect(sql).toMatch(/add column role text not null default ''/);
  });
});

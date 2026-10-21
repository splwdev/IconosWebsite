import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ENQUIRY_TYPES,
  SERVICES,
  contactHrefForProgram,
  describeAnswers,
  enquiryFormSchema,
  parseServiceParam,
} from "./enquiry";
import { contactFormSettingsSchema } from "../settings/contact-form";

const valid = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  company: "Analytical Ltd",
  service: "mls",
  answers: {},
  message: "We need contract support.",
  privacyAgreed: true,
  turnstileToken: "token",
};

describe("parseServiceParam", () => {
  it.each([
    ["mls", "mls"],
    ["VDPO", "vdpo"],
    [" training ", "training"],
    ["adhoc", "adhoc"],
    ["not-sure", "not-sure"],
    [["vdpo", "mls"], "vdpo"],
  ] as const)("reads %j", (input, expected) => {
    expect(parseServiceParam(input as string | string[])).toBe(expected);
  });

  it.each([undefined, "", "anything", "<script>"])("ignores %j", (input) => {
    expect(parseServiceParam(input)).toBeNull();
  });
});

describe("enquiryFormSchema", () => {
  it("accepts a minimal valid enquiry and fills optional defaults", () => {
    const parsed = enquiryFormSchema.parse(valid);
    expect(parsed).toMatchObject({ phone: "", jobTitle: "", employees: "", heardAbout: "", marketingOptIn: false });
  });

  it("requires the privacy box", () => {
    expect(enquiryFormSchema.safeParse({ ...valid, privacyAgreed: false }).success).toBe(false);
  });

  it("requires a known service", () => {
    expect(enquiryFormSchema.safeParse({ ...valid, service: "" }).success).toBe(false);
    expect(enquiryFormSchema.safeParse({ ...valid, service: "litigation" }).success).toBe(false);
  });

  it("accepts the chosen service's listed answers", () => {
    const result = enquiryFormSchema.safeParse({
      ...valid,
      answers: { in_house_team: "No", areas: ["Corporate", "Employment"] },
    });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it("rejects answers that aren't in the list", () => {
    expect(enquiryFormSchema.safeParse({ ...valid, answers: { in_house_team: "Maybe" } }).success).toBe(false);
    expect(enquiryFormSchema.safeParse({ ...valid, answers: { areas: ["Litigation"] } }).success).toBe(false);
  });

  it("rejects answers for a different service", () => {
    expect(enquiryFormSchema.safeParse({ ...valid, answers: { tier: "Growth" } }).success).toBe(false);
  });

  it("rejects several answers to a single-choice question", () => {
    expect(enquiryFormSchema.safeParse({ ...valid, answers: { in_house_team: ["No", "Yes, one person"] } }).success).toBe(
      false
    );
  });

  it("rejects employee and heard-about values outside the lists", () => {
    expect(enquiryFormSchema.safeParse({ ...valid, employees: "a million" }).success).toBe(false);
    expect(enquiryFormSchema.safeParse({ ...valid, heardAbout: "TV" }).success).toBe(false);
  });
});

describe("describeAnswers", () => {
  it("lists answered questions in order, joining ticked boxes", () => {
    expect(
      describeAnswers({ service: "mls", answers: { areas: ["Corporate", "Employment"], in_house_team: "No" } })
    ).toEqual([
      { question: "Do you have an in-house legal team?", answer: "No" },
      { question: "Which areas do you need help with most?", answer: "Corporate, Employment" },
    ]);
  });

  it("skips blanks", () => {
    expect(describeAnswers({ service: "vdpo", answers: { tier: "", urgent: [] } })).toEqual([]);
  });
});

describe("services config", () => {
  it("has five services in wireframe order with unique question ids", () => {
    expect(SERVICES.map((s) => s.key)).toEqual(["mls", "vdpo", "training", "adhoc", "not-sure"]);
    for (const s of SERVICES) {
      const ids = s.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
      if (s.questions.length > 0) expect(s.questionsHeading).toBeTruthy();
    }
  });

  it("matches the enquiry types the database allows (0030)", () => {
    const sql = readFileSync(resolve(__dirname, "../../../supabase/migrations/0030_contact_enquiry_form.sql"), "utf8");
    const check = sql.match(/check \(enquiry_type in \(([\s\S]*?)\)\);/)?.[1] ?? "";
    const allowed = [...check.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect([...allowed].sort()).toEqual([...ENQUIRY_TYPES].sort());
  });

  it("links program pages to their service", () => {
    expect(contactHrefForProgram("subscription-model")).toBe("/contact?service=mls");
    expect(contactHrefForProgram("virtual-data-protection-officer")).toBe("/contact?service=vdpo");
    expect(contactHrefForProgram("ad-hoc-work")).toBe("/contact?service=adhoc");
    expect(contactHrefForProgram("something-new")).toBe("/contact");
  });
});

describe("0030 service links", () => {
  const sql = readFileSync(resolve(__dirname, "../../../supabase/migrations/0030_contact_enquiry_form.sql"), "utf8");

  it("only rewrites exact /contact links", () => {
    const updates = sql.match(/update public\.page_sections s[\s\S]*?;/g) ?? [];
    expect(updates).toHaveLength(4);
    for (const u of updates) {
      expect(u).toMatch(/replace\(s\.content::text, '"\/contact"', '"\/contact\?service=(mls|adhoc|training|vdpo)"'\)::jsonb/);
      expect(u).toMatch(/like '%"\/contact"%'/);
    }
  });
});

describe("contact form settings", () => {
  it("fills the new page fields for rows saved before they existed", () => {
    const parsed = contactFormSettingsSchema.parse({
      recipient_email: "enquiries@iconos-group.com",
      cc_emails: [],
      sender_display_name: "Iconos Group Website",
      send_autoreply: true,
      autoreply_subject: "We've received your enquiry",
      autoreply_message: "Thanks.",
    });
    expect(parsed.next_steps).toHaveLength(3);
    expect(parsed.direct_email).toBe("legal@iconos-group.com");
    expect(parsed.page_intro.length).toBeGreaterThan(0);
  });

  it("rejects a phone number with letters", () => {
    const result = contactFormSettingsSchema.safeParse({
      recipient_email: "a@b.com",
      cc_emails: [],
      sender_display_name: "x",
      send_autoreply: false,
      autoreply_subject: "x",
      autoreply_message: "x",
      direct_phone: "call me",
    });
    expect(result.success).toBe(false);
  });
});

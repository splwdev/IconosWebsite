import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENQUIRY_TYPES } from "./enquiry";
import { WORK_WITH_US_ENQUIRY_TYPES, isLinkedInUrl, parseInterestParam, workWithUsFormSchema } from "./work-with-us";
import { contactFormSettingsSchema } from "../settings/contact-form";
import { pageSectionSchema } from "../content/page-sections";

const valid = {
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
  interest: "referral",
  message: "I'm an accountant with clients who need legal support.",
  privacyAgreed: true,
  turnstileToken: "token",
};

const sql = readFileSync(resolve(__dirname, "../../../supabase/migrations/0031_work_with_us.sql"), "utf8");

describe("work with us form", () => {
  it("accepts a minimal valid enquiry", () => {
    const parsed = workWithUsFormSchema.parse(valid);
    expect(parsed).toMatchObject({ phone: "", company: "", linkedin: "" });
  });

  it.each(["consultant", "referral", "other"])("accepts interest %s", (interest) => {
    expect(workWithUsFormSchema.safeParse({ ...valid, interest }).success).toBe(true);
  });

  it("requires an interest, a message and the privacy box", () => {
    expect(workWithUsFormSchema.safeParse({ ...valid, interest: "" }).success).toBe(false);
    expect(workWithUsFormSchema.safeParse({ ...valid, message: "  " }).success).toBe(false);
    expect(workWithUsFormSchema.safeParse({ ...valid, privacyAgreed: false }).success).toBe(false);
  });

  it("reads ?interest= links", () => {
    expect(parseInterestParam("Referral")).toBe("referral");
    expect(parseInterestParam(["consultant"])).toBe("consultant");
    expect(parseInterestParam("partner")).toBeNull();
    expect(parseInterestParam(undefined)).toBeNull();
  });
});

describe("isLinkedInUrl", () => {
  it.each([
    "",
    "https://www.linkedin.com/in/grace-hopper",
    "https://linkedin.com/in/x",
    "https://uk.linkedin.com/company/iconos",
  ])("accepts %j", (v) => expect(isLinkedInUrl(v)).toBe(true));

  it.each([
    "http://www.linkedin.com/in/x",
    "https://linkedin.com.evil.example/in/x",
    "https://evil.example/?linkedin.com",
    "javascript:alert(1)",
    "linkedin.com/in/x",
  ])("rejects %j", (v) => expect(isLinkedInUrl(v)).toBe(false));
});

describe("0031_work_with_us.sql", () => {
  const rows = [...sql.matchAll(/\(v_page_id, '(\w+)', '(\w+)', \$json\$([\s\S]*?)\$json\$::jsonb, (\d+)\)/g)].map((m) => ({
    section_type: m[1],
    background: m[2],
    content: JSON.parse(m[3] ?? "{}"),
  }));

  it("seeds the wireframe's sections in order", () => {
    expect(rows.map((r) => r.section_type)).toEqual(["steps", "steps", "callout", "cta"]);
  });

  it.each(rows.map((r, i) => [`${i} ${r.section_type}`, r] as const))("%s passes the application schema", (_l, row) => {
    const result = pageSectionSchema.safeParse(row);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it("links the referral panel to the form with referral pre-selected", () => {
    expect(rows[2]?.content).toMatchObject({ layout: "side", button_href: "/work-with-us/enquiry?interest=referral" });
  });

  it("allows every enquiry type either form can store", () => {
    const check = sql.match(/check \(enquiry_type in \(([\s\S]*?)\)\);/)?.[1] ?? "";
    const allowed = [...check.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
    expect(allowed).toEqual([...ENQUIRY_TYPES, ...WORK_WITH_US_ENQUIRY_TYPES].sort());
  });

  it("allows work-with-us as an overview page", () => {
    expect(sql).toMatch(/'clients', 'work-with-us'\)\)/);
  });
});

describe("card grid and callout additions", () => {
  it("default for sections saved before they existed", () => {
    const steps = pageSectionSchema.parse({ section_type: "steps", background: "none", content: { items: [{ title: "A" }] } });
    if (steps.section_type !== "steps") throw new Error("wrong type");
    expect(steps.content.card_style).toBe("filled");
    expect(steps.content.items[0]?.eyebrow).toBe("");
    const callout = pageSectionSchema.parse({ section_type: "callout", background: "none", content: {} });
    if (callout.section_type !== "callout") throw new Error("wrong type");
    expect(callout.content).toMatchObject({ layout: "stacked", eyebrow: "" });
  });
});

describe("work with us settings", () => {
  it("fill in for settings rows saved before they existed", () => {
    const parsed = contactFormSettingsSchema.parse({
      recipient_email: "a@b.com",
      cc_emails: [],
      sender_display_name: "x",
      send_autoreply: false,
      autoreply_subject: "x",
      autoreply_message: "x",
    });
    expect(parsed.wwu_next_steps).toHaveLength(2);
    expect(parsed.wwu_page_title).toBe("Let's work together.");
  });
});

describe("work with us follow-up questions", () => {
  it("accepts consultant lawyer answers from the lists", () => {
    const result = workWithUsFormSchema.safeParse({
      ...valid,
      interest: "consultant",
      answers: { years_qualified: "5 to 10 years", availability: "A few days a week", expertise: ["Corporate", "Employment"] },
    });
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it("rejects consultant answers outside the lists", () => {
    expect(
      workWithUsFormSchema.safeParse({ ...valid, interest: "consultant", answers: { years_qualified: "20 years" } }).success
    ).toBe(false);
  });

  it("accepts a short free-text answer for referral partners, and rejects a long one", () => {
    expect(
      workWithUsFormSchema.safeParse({ ...valid, answers: { usual_clients: "Owner-managed businesses" } }).success
    ).toBe(true);
    expect(workWithUsFormSchema.safeParse({ ...valid, answers: { usual_clients: "x".repeat(501) } }).success).toBe(false);
  });

  it("rejects answers belonging to a different choice", () => {
    expect(workWithUsFormSchema.safeParse({ ...valid, answers: { years_qualified: "Up to 5 years" } }).success).toBe(false);
  });

  it("describes answers for emails", async () => {
    const { describeInterestAnswers } = await import("./work-with-us");
    expect(
      describeInterestAnswers({ interest: "consultant", answers: { expertise: ["Corporate", "Employment"], availability: "" } })
    ).toEqual([{ question: "Areas of expertise", answer: "Corporate, Employment" }]);
  });

  it("accepts the honeypot field (the server drops filled ones)", () => {
    expect(workWithUsFormSchema.parse({ ...valid, website: "spam" }).website).toBe("spam");
    expect(workWithUsFormSchema.parse(valid).website).toBe("");
  });
});

describe("0032_enquiry_form_spec.sql", () => {
  const sql2 = readFileSync(resolve(__dirname, "../../../supabase/migrations/0032_enquiry_form_spec.sql"), "utf8");

  it("only replaces the auto-reply if it's still the original default", () => {
    expect(sql2).toMatch(
      /value->>'autoreply_message' = 'Thanks for getting in touch with Iconos Group\. A member of our team will be in touch shortly\.'/
    );
  });

  it("points Data Protection and GDPR buttons at Virtual DPO, exact /contact links only", () => {
    expect(sql2).toMatch(/replace\(s\.content::text, '"\/contact"', '"\/contact\?service=vdpo"'\)[\s\S]*?slug = 'data-protection-gdpr'/);
  });

  it("moves Work With Us links to the new form address", () => {
    expect(sql2).toMatch(/replace\(s\.content::text, '\/work-with-us\/get-in-touch', '\/work-with-us\/enquiry'\)/);
  });
});

"use server";

import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  enquiryType: z.enum([
    "Managed Legal Services",
    "Virtual Data Protection Officer",
    "Ad Hoc Work",
    "General Enquiry",
  ]),
  message: z.string().min(1, "Please add a short message"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export interface ContactFormResult {
  ok: boolean;
  errors?: string[];
}

/**
 * TODO (next task): verify a Cloudflare Turnstile token here, then send via
 * a transactional email provider to legal@iconos-group.com (Q25), and log
 * the submission to a `contact_submissions` table for audit/reference.
 * For now this validates the payload server-side (never trust client-side
 * validation alone) and returns success so the UI/UX can be reviewed.
 */
export async function submitContactForm(
  values: ContactFormValues
): Promise<ContactFormResult> {
  const parsed = contactFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  // eslint-disable-next-line no-console
  console.log("[contact form submission — not yet wired to email]", parsed.data);

  return { ok: true };
}

"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendGraphMail } from "@/lib/graph-mail";

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
  turnstileToken: z.string().min(1, "Please complete the verification challenge"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export interface ContactFormResult {
  ok: boolean;
  errors?: string[];
}

/**
 * Verifies a Turnstile token against Cloudflare's siteverify endpoint.
 * Server-side only — the secret key must never reach the browser.
 * If TURNSTILE_SECRET_KEY isn't configured (e.g. local dev before Cloudflare
 * setup), verification is skipped with a console warning rather than
 * blocking every submission — but this must be set in production.
 */
async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn(
      "[contact form] TURNSTILE_SECRET_KEY not set — skipping bot verification. Set this before production."
    );
    return true;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    }
  );

  const result = (await response.json()) as { success: boolean };
  return result.success;
}

/**
 * Sends the enquiry via Microsoft Graph, from the dedicated
 * enquiries@iconos-group.com mailbox. See src/lib/graph-mail.ts for the
 * token flow; this just shapes the message content.
 */
async function sendNotificationEmail(values: ContactFormValues): Promise<boolean> {
  const toEmail = process.env.CONTACT_TO_EMAIL || "legal@iconos-group.com";

  return sendGraphMail({
    toEmail,
    replyToEmail: values.email,
    subject: `New enquiry: ${values.enquiryType} — ${values.company}`,
    text: [
      `Name: ${values.name}`,
      `Company: ${values.company}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`,
      `Enquiring about: ${values.enquiryType}`,
      "",
      "Message:",
      values.message,
    ].join("\n"),
  });
}

export async function submitContactForm(
  values: ContactFormValues
): Promise<ContactFormResult> {
  const parsed = contactFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  const turnstileOk = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstileOk) {
    return {
      ok: false,
      errors: ["Verification failed — please try the form again."],
    };
  }

  const emailSent = await sendNotificationEmail(parsed.data);

  // Store the submission regardless of email outcome — this is the audit
  // trail / fallback if Resend has an outage, and lets staff review
  // enquiries directly in Supabase if needed.
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("contact_submissions").insert({
    name: parsed.data.name,
    company: parsed.data.company,
    email: parsed.data.email,
    phone: parsed.data.phone,
    enquiry_type: parsed.data.enquiryType,
    message: parsed.data.message,
    turnstile_verified: turnstileOk,
    email_sent: emailSent,
  });

  if (dbError) {
    console.error("[contact form] Failed to store submission:", dbError.message);
    // Don't fail the user-facing request over a storage error if the email
    // itself went out successfully — they still got through to the client.
    if (!emailSent) {
      return {
        ok: false,
        errors: ["Something went wrong sending your enquiry. Please email legal@iconos-group.com directly."],
      };
    }
  }

  return { ok: true };
}

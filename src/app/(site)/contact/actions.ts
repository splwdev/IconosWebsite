"use server";
 
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendGraphMail } from "@/lib/graph-mail";
import {
  contactFormSettingsSchema,
  DEFAULT_CONTACT_FORM_SETTINGS,
  type ContactFormSettings,
} from "@/lib/settings/contact-form";
 
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
 * Reads admin-configurable routing/copy from site_settings via the
 * get_contact_form_settings() RPC (SECURITY DEFINER — see
 * 0005_add_contact_form_settings_rpc.sql). This runs on behalf of an
 * anonymous visitor with no session, so a direct table SELECT would be
 * blocked by RLS (site_settings is admin-only) — the RPC is the deliberate,
 * narrow exception to that.
 *
 * Falls back to CONTACT_TO_EMAIL / hardcoded defaults if the settings row
 * is missing or fails validation, so a submission never hard-fails purely
 * because of a settings problem.
 */
async function loadContactFormSettings(): Promise<ContactFormSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_contact_form_settings");
 
    if (error) {
      console.error("[contact form] get_contact_form_settings RPC failed:", error.message);
    } else if (data) {
      const parsed = contactFormSettingsSchema.safeParse(data);
      if (parsed.success) return parsed.data;
      console.error(
        "[contact form] Stored contact_form settings failed validation:",
        parsed.error.issues
      );
    }
  } catch (err) {
    console.error("[contact form] Unexpected error loading settings:", err);
  }
 
  return {
    ...DEFAULT_CONTACT_FORM_SETTINGS,
    recipient_email: process.env.CONTACT_TO_EMAIL || DEFAULT_CONTACT_FORM_SETTINGS.recipient_email,
  };
}
 
/**
 * Sends the enquiry via Microsoft Graph, from the dedicated
 * enquiries@iconos-group.com mailbox. See src/lib/graph-mail.ts for the
 * token flow; this just shapes the message content.
 */
async function sendNotificationEmail(
  values: ContactFormValues,
  settings: ContactFormSettings
): Promise<boolean> {
  return sendGraphMail({
    toEmail: settings.recipient_email,
    ccEmails: settings.cc_emails,
    replyToEmail: values.email,
    fromDisplayName: settings.sender_display_name,
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
 
/**
 * Best-effort confirmation email to the enquirer. Never blocks or fails the
 * overall submission — the visitor's own enquiry going through is what
 * matters; a missed auto-reply is logged, not surfaced to them.
 */
async function sendAutoreplyEmail(
  values: ContactFormValues,
  settings: ContactFormSettings
): Promise<void> {
  if (!settings.send_autoreply) return;
 
  try {
    await sendGraphMail({
      toEmail: values.email,
      replyToEmail: settings.recipient_email,
      fromDisplayName: settings.sender_display_name,
      subject: settings.autoreply_subject,
      text: settings.autoreply_message,
    });
  } catch (err) {
    console.error("[contact form] Auto-reply failed (non-blocking):", err);
  }
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
 
  const settings = await loadContactFormSettings();
  const emailSent = await sendNotificationEmail(parsed.data, settings);
 
  // Store the submission regardless of email outcome — this is the audit
  // trail / fallback if Graph has an outage, and lets staff review
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
        errors: [
          "Something went wrong sending your enquiry. Please email legal@iconos-group.com directly.",
        ],
      };
    }
  }
 
  // Fire-and-forget-ish: awaited so we can log failures, but its outcome
  // never changes the response to the visitor.
  await sendAutoreplyEmail(parsed.data, settings);
 
  return { ok: true };
}
"use server";

import { createClient } from "@/lib/supabase/server";
import { sendGraphMail } from "@/lib/graph-mail";
import { verifyTurnstileToken } from "@/lib/contact/turnstile";
import { loadContactFormSettings } from "@/lib/settings/load-contact-form";
import type { ContactFormSettings } from "@/lib/settings/contact-form";
import {
  describeAnswers,
  enquiryFormSchema,
  getService,
  type EnquiryDetail,
  type EnquiryFormInput,
  type EnquiryFormValues,
} from "@/lib/contact/enquiry";

export interface ContactFormResult {
  ok: boolean;
  errors?: string[];
}

function fullName(values: EnquiryFormValues): string {
  return `${values.firstName} ${values.lastName}`.trim();
}

/** Plain-text email body: every field, labelled, blanks shown as "—". */
function buildNotificationText(values: EnquiryFormValues, enquiryType: string, details: EnquiryDetail[]): string {
  const line = (label: string, value: string) => `${label}: ${value || "—"}`;
  return [
    "ABOUT THEM",
    line("Name", fullName(values)),
    line("Email", values.email),
    line("Phone", values.phone),
    line("Job title", values.jobTitle),
    "",
    "THEIR BUSINESS",
    line("Company", values.company),
    line("Employees", values.employees),
    line("Sector", values.sector),
    "",
    "HOW WE CAN HELP",
    line("Service", enquiryType),
    ...details.map((d) => line(d.question, d.answer)),
    "",
    "WHAT THEY NEED",
    values.message,
    "",
    line("Heard about us", values.heardAbout),
    line("Marketing emails", values.marketingOptIn ? "Yes, opted in" : "No"),
  ].join("\n");
}

async function sendNotificationEmail(
  values: EnquiryFormValues,
  enquiryType: string,
  details: EnquiryDetail[],
  settings: ContactFormSettings
): Promise<boolean> {
  return sendGraphMail({
    toEmail: settings.recipient_email,
    ccEmails: settings.cc_emails,
    replyToEmail: values.email,
    fromDisplayName: settings.sender_display_name,
    subject: `New enquiry: ${enquiryType} — ${values.company}`,
    text: buildNotificationText(values, enquiryType, details),
  });
}

/**
 * Best-effort confirmation email to the enquirer. Never blocks or fails the
 * overall submission — a missed auto-reply is logged, not surfaced.
 */
async function sendAutoreplyEmail(values: EnquiryFormValues, settings: ContactFormSettings): Promise<void> {
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

export async function submitContactForm(input: EnquiryFormInput): Promise<ContactFormResult> {
  const parsed = enquiryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] };
  }
  const values = parsed.data;
  const service = getService(values.service);
  if (!service) return { ok: false, errors: ["Please choose how we can help."] };

  const turnstileOk = await verifyTurnstileToken(values.turnstileToken);
  if (!turnstileOk) {
    return { ok: false, errors: ["Verification failed — please try the form again."] };
  }

  const details = describeAnswers(values);
  const settings = await loadContactFormSettings();
  const emailSent = await sendNotificationEmail(values, service.enquiryType, details, settings);

  // Stored regardless of email outcome — the audit trail and fallback if
  // Graph has an outage.
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("contact_submissions").insert({
    name: fullName(values),
    first_name: values.firstName,
    last_name: values.lastName,
    company: values.company,
    email: values.email,
    phone: values.phone,
    job_title: values.jobTitle,
    company_size: values.employees,
    sector: values.sector,
    enquiry_type: service.enquiryType,
    service_details: details,
    message: values.message,
    heard_about: values.heardAbout,
    privacy_agreed: values.privacyAgreed,
    marketing_opt_in: values.marketingOptIn,
    turnstile_verified: turnstileOk,
    email_sent: emailSent,
  });

  if (dbError) {
    console.error("[contact form] Failed to store submission:", dbError.message);
    // Only fail the visitor's request if neither copy got through.
    if (!emailSent) {
      return {
        ok: false,
        errors: [`Something went wrong sending your enquiry. Please email ${settings.direct_email} directly.`],
      };
    }
  }

  await sendAutoreplyEmail(values, settings);
  return { ok: true };
}

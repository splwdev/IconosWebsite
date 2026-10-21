"use server";

import { createClient } from "@/lib/supabase/server";
import { sendGraphMail } from "@/lib/graph-mail";
import { verifyTurnstileToken } from "@/lib/contact/turnstile";
import { loadContactFormSettings } from "@/lib/settings/load-contact-form";
import {
  getInterest,
  workWithUsFormSchema,
  type WorkWithUsFormInput,
  type WorkWithUsFormValues,
} from "@/lib/contact/work-with-us";

export interface WorkWithUsFormResult {
  ok: boolean;
  errors?: string[];
}

function buildNotificationText(values: WorkWithUsFormValues, interestTitle: string): string {
  const line = (label: string, value: string) => `${label}: ${value || "—"}`;
  return [
    "WORK WITH US ENQUIRY",
    line("Interested as", interestTitle),
    "",
    line("Name", `${values.firstName} ${values.lastName}`),
    line("Email", values.email),
    line("Phone", values.phone),
    line("Firm or company", values.company),
    line("LinkedIn", values.linkedin),
    "",
    "THEIR EXPERIENCE AND WHAT THEY'D LIKE",
    values.message,
  ].join("\n");
}

export async function submitWorkWithUsForm(input: WorkWithUsFormInput): Promise<WorkWithUsFormResult> {
  const parsed = workWithUsFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] };
  }
  const values = parsed.data;
  const interest = getInterest(values.interest);
  if (!interest) return { ok: false, errors: ["Please choose how you'd like to work with us."] };

  const turnstileOk = await verifyTurnstileToken(values.turnstileToken);
  if (!turnstileOk) {
    return { ok: false, errors: ["Verification failed — please try the form again."] };
  }

  const settings = await loadContactFormSettings();
  const name = `${values.firstName} ${values.lastName}`.trim();

  const emailSent = await sendGraphMail({
    toEmail: settings.recipient_email,
    ccEmails: settings.cc_emails,
    replyToEmail: values.email,
    fromDisplayName: settings.sender_display_name,
    subject: `Work With Us: ${interest.title} — ${name}`,
    text: buildNotificationText(values, interest.title),
  });

  const supabase = await createClient();
  const { error: dbError } = await supabase.from("contact_submissions").insert({
    name,
    first_name: values.firstName,
    last_name: values.lastName,
    company: values.company,
    email: values.email,
    phone: values.phone,
    linkedin_url: values.linkedin,
    enquiry_type: interest.enquiryType,
    message: values.message,
    privacy_agreed: values.privacyAgreed,
    turnstile_verified: turnstileOk,
    email_sent: emailSent,
  });

  if (dbError) {
    console.error("[work with us form] Failed to store submission:", dbError.message);
    if (!emailSent) {
      return {
        ok: false,
        errors: [`Something went wrong sending your message. Please email ${settings.direct_email} directly.`],
      };
    }
  }

  return { ok: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { sendGraphMail } from "@/lib/graph-mail";
import { verifyTurnstileToken } from "@/lib/contact/turnstile";
import { formatSubmittedAt, renderSections, type EmailSection } from "@/lib/contact/email-text";
import { loadContactFormSettings } from "@/lib/settings/load-contact-form";
import {
  MARKETING_OPT_IN_WORDING,
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

/** Every answer, labelled — used for the notification and the enquirer's copy. */
function answerSections(values: EnquiryFormValues, enquiryType: string, details: EnquiryDetail[]): EmailSection[] {
  return [
    {
      heading: "About you",
      lines: [
        { label: "Name", value: fullName(values) },
        { label: "Work email", value: values.email },
        { label: "Phone", value: values.phone },
        { label: "Job title", value: values.jobTitle },
      ],
    },
    {
      heading: "About your business",
      lines: [
        { label: "Company", value: values.company },
        { label: "Number of employees", value: values.employees },
        { label: "Sector", value: values.sector },
      ],
    },
    {
      heading: "How can we help?",
      lines: [{ label: "Service", value: enquiryType }, ...details.map((d) => ({ label: d.question, value: d.answer }))],
    },
    {
      heading: "Anything else?",
      lines: [
        { label: "How did you hear about us", value: values.heardAbout },
        { label: "Marketing emails", value: values.marketingOptIn ? "Yes, opted in" : "No" },
      ],
      text: `\nWhat you need:\n${values.message}`,
    },
  ];
}

export async function submitContactForm(input: EnquiryFormInput): Promise<ContactFormResult> {
  const parsed = enquiryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] };
  }
  const values = parsed.data;

  // Honeypot filled in: almost certainly a bot. Look successful, do nothing.
  if (values.website) return { ok: true };

  const service = getService(values.service);
  if (!service) return { ok: false, errors: ["Please choose how we can help."] };

  const turnstileOk = await verifyTurnstileToken(values.turnstileToken);
  if (!turnstileOk) {
    return { ok: false, errors: ["Verification failed — please try the form again."] };
  }

  const submittedAt = new Date();
  const details = describeAnswers(values);
  const sections = answerSections(values, service.enquiryType, details);
  const settings = await loadContactFormSettings();

  const emailSent = await sendGraphMail({
    toEmail: settings.recipient_email,
    ccEmails: settings.cc_emails,
    replyToEmail: values.email,
    fromDisplayName: settings.sender_display_name,
    subject: `New website enquiry: ${service.enquiryType}, ${values.company}`,
    text: [`Submitted: ${formatSubmittedAt(submittedAt)}`, renderSections(sections)].join("\n\n"),
  });

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
    // A record of the opt-in: when, and the exact wording agreed to.
    marketing_opt_in_at: values.marketingOptIn ? submittedAt.toISOString() : null,
    marketing_opt_in_wording: values.marketingOptIn ? MARKETING_OPT_IN_WORDING : "",
    turnstile_verified: turnstileOk,
    email_sent: emailSent,
    created_at: submittedAt.toISOString(),
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

  // Confirmation with a copy of their answers. Best effort: a missed
  // auto-reply is logged, never shown to the visitor.
  if (settings.send_autoreply) {
    try {
      await sendGraphMail({
        toEmail: values.email,
        replyToEmail: settings.recipient_email,
        fromDisplayName: settings.sender_display_name,
        subject: settings.autoreply_subject,
        text: [
          settings.autoreply_message,
          `For your records, here's a copy of what you sent us on ${formatSubmittedAt(submittedAt)}:`,
          renderSections(sections),
        ].join("\n\n"),
      });
    } catch (err) {
      console.error("[contact form] Auto-reply failed (non-blocking):", err);
    }
  }

  return { ok: true };
}

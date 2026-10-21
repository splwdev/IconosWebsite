"use server";

import { createClient } from "@/lib/supabase/server";
import { sendGraphMail } from "@/lib/graph-mail";
import { verifyTurnstileToken } from "@/lib/contact/turnstile";
import { formatSubmittedAt, renderSections, type EmailSection } from "@/lib/contact/email-text";
import { loadContactFormSettings } from "@/lib/settings/load-contact-form";
import type { EnquiryDetail } from "@/lib/contact/enquiry";
import {
  describeInterestAnswers,
  getInterest,
  workWithUsFormSchema,
  type InterestOption,
  type WorkWithUsFormInput,
  type WorkWithUsFormValues,
} from "@/lib/contact/work-with-us";

export interface WorkWithUsFormResult {
  ok: boolean;
  errors?: string[];
}

/** Every answer, labelled — used for the notification and the enquirer's copy. */
function answerSections(values: WorkWithUsFormValues, interest: InterestOption, details: EnquiryDetail[]): EmailSection[] {
  return [
    {
      heading: "About you",
      lines: [
        { label: "Name", value: `${values.firstName} ${values.lastName}` },
        { label: "Email", value: values.email },
        { label: "Phone", value: values.phone },
        { label: "Firm or company", value: values.company },
        { label: "LinkedIn profile", value: values.linkedin },
      ],
    },
    {
      heading: "How would you like to work with us?",
      lines: [{ label: "Interested as", value: interest.title }, ...details.map((d) => ({ label: d.question, value: d.answer }))],
    },
    {
      heading: "Tell us a little more",
      lines: [],
      text: values.message,
    },
  ];
}

export async function submitWorkWithUsForm(input: WorkWithUsFormInput): Promise<WorkWithUsFormResult> {
  const parsed = workWithUsFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] };
  }
  const values = parsed.data;

  // Honeypot filled in: almost certainly a bot. Look successful, do nothing.
  if (values.website) return { ok: true };

  const interest = getInterest(values.interest);
  if (!interest) return { ok: false, errors: ["Please choose how you'd like to work with us."] };

  const turnstileOk = await verifyTurnstileToken(values.turnstileToken);
  if (!turnstileOk) {
    return { ok: false, errors: ["Verification failed — please try the form again."] };
  }

  const submittedAt = new Date();
  const name = `${values.firstName} ${values.lastName}`.trim();
  const details = describeInterestAnswers(values);
  const sections = answerSections(values, interest, details);
  const settings = await loadContactFormSettings();

  // A separate Work With Us address replaces the main recipient and CCs.
  const ownRecipient = settings.wwu_recipient_email;
  const emailSent = await sendGraphMail({
    toEmail: ownRecipient || settings.recipient_email,
    ccEmails: ownRecipient ? [] : settings.cc_emails,
    replyToEmail: values.email,
    fromDisplayName: settings.sender_display_name,
    subject: `New Work with us enquiry: ${interest.subjectLabel}, ${name}`,
    text: [`Submitted: ${formatSubmittedAt(submittedAt)}`, renderSections(sections)].join("\n\n"),
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
    service_details: details,
    message: values.message,
    privacy_agreed: values.privacyAgreed,
    turnstile_verified: turnstileOk,
    email_sent: emailSent,
    created_at: submittedAt.toISOString(),
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

  if (settings.send_autoreply) {
    try {
      await sendGraphMail({
        toEmail: values.email,
        replyToEmail: ownRecipient || settings.recipient_email,
        fromDisplayName: settings.sender_display_name,
        subject: settings.wwu_autoreply_subject,
        text: [
          settings.wwu_autoreply_message,
          `For your records, here's a copy of what you sent us on ${formatSubmittedAt(submittedAt)}:`,
          renderSections(sections),
        ].join("\n\n"),
      });
    } catch (err) {
      console.error("[work with us form] Auto-reply failed (non-blocking):", err);
    }
  }

  return { ok: true };
}

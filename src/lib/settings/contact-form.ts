import { z } from "zod";
 
export const CONTACT_FORM_SETTINGS_KEY = "contact_form" as const;
 
export const nextStepSchema = z.object({
  title: z.string().trim().min(1, "Required").max(80, "Keep it under 80 characters"),
  body: z.string().trim().max(200, "Keep it under 200 characters").default(""),
});

export const DEFAULT_NEXT_STEPS = [
  { title: "We read your enquiry", body: "A real person reviews it, not a bot." },
  { title: "We get back to you", body: "Within one working day, by phone or email." },
  { title: "A no-obligation chat", body: "We'll understand your business and suggest the right approach." },
];

export const DEFAULT_WWU_NEXT_STEPS = [
  { title: "We read your message", body: "Every enquiry is reviewed by the team." },
  { title: "We get in touch", body: "If there's a good fit, we'll arrange an informal chat." },
];
export const DEFAULT_AUTOREPLY_MESSAGE =
  "Thank you, we've got your enquiry. We'll be in touch within one working day.";
const DEFAULT_WWU_AUTOREPLY_MESSAGE =
  "Thank you, we've got your message. Every enquiry is reviewed by the team, and if there's a good fit we'll be in touch to arrange an informal chat.";
const DEFAULT_WWU_TITLE = "Let's work together.";
const DEFAULT_WWU_INTRO =
  "Whether you're a consultant lawyer or a potential referral partner, tell us a little about yourself and we'll be in touch.";
const DEFAULT_WWU_HELP_TEXT =
  "This form is for consultant lawyers and referral partners. For help with your business, use our enquiry form.";

export const contactFormSettingsSchema = z.object({
  recipient_email: z.string().email("Enter a valid email address"),
  cc_emails: z
    .array(z.string())
    .max(5, "Up to 5 CC addresses")
    .refine((arr) => arr.every((e) => z.string().email().safeParse(e).success), {
      message: "Enter valid email addresses, one per line",
    }),
  sender_display_name: z.string().min(1, "Required").max(80, "Keep it under 80 characters"),
  send_autoreply: z.boolean(),
  autoreply_subject: z.string().min(1, "Required").max(150, "Keep it under 150 characters"),
  autoreply_message: z.string().min(1, "Required").max(2000, "Keep it under 2000 characters"),
  // Contact page copy. Defaults keep settings rows saved before these
  // existed valid.
  page_intro: z
    .string()
    .trim()
    .min(1, "Required")
    .max(300, "Keep it under 300 characters")
    .default("Tell us a little about your business and what you're enquiring about, and we'll get back to you."),
  next_steps: z.array(nextStepSchema).length(3, "Three steps").default(DEFAULT_NEXT_STEPS),
  direct_email: z.string().trim().email("Enter a valid email address").default("legal@iconos-group.com"),
  /** Shown as a tap-to-call link; leave blank to hide. */
  direct_phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\s-]*$/, "Digits, spaces, +, - and brackets only")
    .default("020 4539 5800"),
  // Work With Us form page (/work-with-us/enquiry). Same recipients.
  wwu_page_title: z.string().trim().min(1, "Required").max(120).default(DEFAULT_WWU_TITLE),
  wwu_page_intro: z.string().trim().min(1, "Required").max(300).default(DEFAULT_WWU_INTRO),
  wwu_next_steps: z.array(nextStepSchema).length(2, "Two steps").default(DEFAULT_WWU_NEXT_STEPS),
  wwu_help_text: z.string().trim().max(300).default(DEFAULT_WWU_HELP_TEXT),
  /** Where Work With Us enquiries go; blank means the main recipient above. */
  wwu_recipient_email: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address, or leave blank"),
  wwu_autoreply_subject: z.string().trim().min(1, "Required").max(150).default("We've received your message"),
  wwu_autoreply_message: z.string().trim().min(1, "Required").max(2000).default(DEFAULT_WWU_AUTOREPLY_MESSAGE),
});
 
export type ContactFormSettings = z.infer<typeof contactFormSettingsSchema>;
 
// Last-resort fallback if the site_settings row is ever missing or fails
// validation (e.g. a fresh environment before migrations/seed have run).
// recipient_email is further overridable by CONTACT_TO_EMAIL at the call
// site — see loadContactFormSettings() in app/(site)/contact/actions.ts.
export const DEFAULT_CONTACT_FORM_SETTINGS: ContactFormSettings = {
  recipient_email: "enquiries@iconos-group.com",
  cc_emails: [],
  sender_display_name: "Iconos Group Website",
  send_autoreply: true,
  autoreply_subject: "We've received your enquiry",
  autoreply_message: DEFAULT_AUTOREPLY_MESSAGE,
  page_intro: "Tell us a little about your business and what you're enquiring about, and we'll get back to you.",
  next_steps: DEFAULT_NEXT_STEPS,
  direct_email: "legal@iconos-group.com",
  direct_phone: "020 4539 5800",
  wwu_page_title: DEFAULT_WWU_TITLE,
  wwu_page_intro: DEFAULT_WWU_INTRO,
  wwu_next_steps: DEFAULT_WWU_NEXT_STEPS,
  wwu_help_text: DEFAULT_WWU_HELP_TEXT,
  wwu_recipient_email: "",
  wwu_autoreply_subject: "We've received your message",
  wwu_autoreply_message: DEFAULT_WWU_AUTOREPLY_MESSAGE,
};
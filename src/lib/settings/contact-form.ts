import { z } from "zod";
 
export const CONTACT_FORM_SETTINGS_KEY = "contact_form" as const;
 
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
  autoreply_message:
    "Thanks for getting in touch with Iconos Group. A member of our team will be in touch shortly.",
};
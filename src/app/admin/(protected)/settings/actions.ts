"use server";
 
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  contactFormSettingsSchema,
  CONTACT_FORM_SETTINGS_KEY,
  DEFAULT_CONTACT_FORM_SETTINGS,
  type ContactFormSettings,
} from "@/lib/settings/contact-form";
import { sendGraphMail } from "@/lib/graph-mail";
import { formatSubmittedAt } from "@/lib/contact/email-text";
import { getStaffContext } from "@/lib/admin/staff-context";
 
export interface ContactFormSettingsResult {
  ok: boolean;
  errors?: string[];
}
 
export interface LoadedContactFormSettings {
  settings: ContactFormSettings;
  updatedAt: string | null;
}
 
/**
 * Reads the current settings for the admin UI. Authorization is entirely
 * via RLS — createClient() is bound to the signed-in staff member's
 * session/cookies, and the "admins manage site settings" policy
 * (is_staff_admin()) is what actually gates this, not any check here.
 * A non-admin staff member calling this simply gets no row back.
 */
export async function getContactFormSettings(): Promise<LoadedContactFormSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value, updated_at")
    .eq("key", CONTACT_FORM_SETTINGS_KEY)
    .maybeSingle();
 
  if (error) {
    console.error("[admin/settings] Failed to load contact form settings:", error.message);
    return null;
  }
 
  if (!data) return null;
 
  const parsed = contactFormSettingsSchema.safeParse(data.value);
  if (!parsed.success) {
    console.error(
      "[admin/settings] Stored contact_form settings failed validation:",
      parsed.error.issues
    );
    return null;
  }
 
  return { settings: parsed.data, updatedAt: data.updated_at };
}
 
export async function updateContactFormSettings(
  input: ContactFormSettings
): Promise<ContactFormSettingsResult> {
  const parsed = contactFormSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }
 
  const supabase = await createClient();
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  const { data: updatedRows, error } = await supabase
    .from("site_settings")
    .update({ value: parsed.data, updated_by: user?.id ?? null })
    .eq("key", CONTACT_FORM_SETTINGS_KEY)
    .select("key");
 
  // RLS denies an unauthorized UPDATE by matching zero rows, not by
  // raising a Postgres error — so a 'staff' (non-admin) session lands here
  // with error === null and updatedRows === []. Both branches must be
  // treated as failure, or a denied save would silently report ok: true.
  if (error || !updatedRows || updatedRows.length === 0) {
    if (error) {
      console.error("[admin/settings] Failed to update contact form settings:", error.message);
    }
    return {
      ok: false,
      errors: ["Could not save settings. You may not have permission to edit these."],
    };
  }
 
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  revalidatePath("/work-with-us/enquiry");
  return { ok: true };
}
export interface FormsStatus {
  emailConfigured: boolean;
  senderMailbox: string;
  turnstileConfigured: boolean;
}

/** Whether the email and spam-check settings exist in this deployment (never their values). */
export async function getFormsStatus(): Promise<FormsStatus> {
  return {
    emailConfigured: Boolean(
      process.env.GRAPH_TENANT_ID &&
        process.env.GRAPH_CLIENT_ID &&
        process.env.GRAPH_CLIENT_SECRET &&
        process.env.GRAPH_SENDER_MAILBOX
    ),
    senderMailbox: process.env.GRAPH_SENDER_MAILBOX ?? "",
    turnstileConfigured: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY),
  };
}

export interface TestEmailResult {
  ok: boolean;
  message: string;
}

/**
 * Sends a short test email to the saved recipient(s), so an admin can
 * check delivery without filling in the public form. Admins only: this
 * uses the app's own Microsoft 365 credentials, not RLS, so the role is
 * checked here.
 */
export async function sendTestEmail(): Promise<TestEmailResult> {
  const staff = await getStaffContext();
  if (staff?.role !== "admin") return { ok: false, message: "Only admins can send a test email." };

  const status = await getFormsStatus();
  if (!status.emailConfigured) {
    return {
      ok: false,
      message:
        "Email sending isn't set up on this site yet (the Microsoft 365 settings are missing in Cloudflare). Enquiries are still saved here.",
    };
  }

  const loaded = await getContactFormSettings();
  const settings = loaded?.settings ?? DEFAULT_CONTACT_FORM_SETTINGS;
  const recipients = [...new Set([settings.recipient_email, settings.wwu_recipient_email].filter(Boolean))];

  const sent = await Promise.all(
    recipients.map((to) =>
      sendGraphMail({
        toEmail: to,
        fromDisplayName: settings.sender_display_name,
        subject: "Test email from the Iconos website",
        text: [
          "This is a test from admin → Settings on the Iconos Group website.",
          `Sent by ${staff.email} on ${formatSubmittedAt(new Date())}.`,
          "If you're reading this, enquiry emails will reach this address.",
        ].join("\n\n"),
      })
    )
  );

  return sent.every(Boolean)
    ? { ok: true, message: `Test email sent to ${recipients.join(" and ")}. Check the inbox (and junk folder).` }
    : {
        ok: false,
        message:
          "Microsoft 365 refused the email. The sending mailbox, app registration or its access policy may need checking. Details are in the Cloudflare logs.",
      };
}

"use server";
 
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  contactFormSettingsSchema,
  CONTACT_FORM_SETTINGS_KEY,
  type ContactFormSettings,
} from "@/lib/settings/contact-form";
 
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
  return { ok: true };
}
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  contactFormSettingsSchema,
  DEFAULT_CONTACT_FORM_SETTINGS,
  type ContactFormSettings,
} from "./contact-form";

/**
 * Reads admin-configurable routing and page copy from site_settings via the
 * get_contact_form_settings() RPC (SECURITY DEFINER — see
 * 0005_add_contact_form_settings_rpc.sql). Visitors have no session, so a
 * direct table SELECT would be blocked by RLS (site_settings is admin-only);
 * the RPC is the deliberate, narrow exception.
 *
 * Falls back to CONTACT_TO_EMAIL / defaults if the row is missing or fails
 * validation, so neither the page nor a submission ever hard-fails purely
 * because of a settings problem. Cached per request (page + metadata).
 */
export const loadContactFormSettings = cache(async (): Promise<ContactFormSettings> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_contact_form_settings");

    if (error) {
      console.error("[contact form] get_contact_form_settings RPC failed:", error.message);
    } else if (data) {
      const parsed = contactFormSettingsSchema.safeParse(data);
      if (parsed.success) return parsed.data;
      console.error("[contact form] Stored contact_form settings failed validation:", parsed.error.issues);
    }
  } catch (err) {
    console.error("[contact form] Unexpected error loading settings:", err);
  }

  return {
    ...DEFAULT_CONTACT_FORM_SETTINGS,
    recipient_email: process.env.CONTACT_TO_EMAIL || DEFAULT_CONTACT_FORM_SETTINGS.recipient_email,
  };
});

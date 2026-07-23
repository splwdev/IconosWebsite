"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PREVIEW_COOKIE } from "@/lib/theme/get-active-theme";
import { themeTokensSchema } from "@/lib/theme/types";
import { checkThemeContrast } from "@/lib/theme/contrast";

/**
 * Sets a private, staff-only preview cookie so the requesting browser (and
 * only that browser) renders `themeId` on every page, including the real
 * homepage — not a mockup. RLS on `themes` means a forged/guessed id from a
 * non-staff session simply resolves to nothing in getActiveTheme().
 */
export async function previewTheme(themeId: string) {
  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_COOKIE, themeId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 hours
  });
  redirect("/");
}

export async function exitPreview() {
  const cookieStore = await cookies();
  cookieStore.delete(PREVIEW_COOKIE);
  redirect("/");
}

/**
 * Publishes a theme site-wide via the publish_theme() RPC (security definer
 * — see 0001_theme_management.sql), which atomically archives whatever was
 * previously published and writes an audit log row. Then clears the
 * previewer's own cookie (their preview is now just... the live site) and
 * revalidates cached pages so the change is visible immediately rather than
 * waiting for the next cache expiry.
 */
export async function publishTheme(themeId: string) {
  const supabase = await createClient();

  // Defense in depth: the editor UI already blocks publishing a
  // contrast-failing theme, but re-check here since this action can be
  // invoked directly (e.g. the themes list "Publish" button skips the
  // editor entirely for already-valid drafts).
  const { data: theme, error: fetchError } = await supabase
    .from("themes")
    .select("tokens")
    .eq("id", themeId)
    .single();

  if (fetchError || !theme) {
    throw new Error("Could not find theme to publish");
  }

  const parsed = themeTokensSchema.safeParse(theme.tokens);
  if (!parsed.success) {
    throw new Error("Theme has invalid token data and cannot be published");
  }

  const contrastCheck = checkThemeContrast(parsed.data);
  if (!contrastCheck.passes) {
    throw new Error(`Cannot publish: ${contrastCheck.failures.join("; ")}`);
  }

  const { error } = await supabase.rpc("publish_theme", { target_id: themeId });

  if (error) {
    throw new Error(`Failed to publish theme: ${error.message}`);
  }

  const cookieStore = await cookies();
  cookieStore.delete(PREVIEW_COOKIE);

  revalidatePath("/", "layout");
  revalidatePath("/admin/themes");
}

export async function duplicateTheme(themeId: string) {
  const supabase = await createClient();
  const { data: original, error: fetchError } = await supabase
    .from("themes")
    .select("name, tokens, notes")
    .eq("id", themeId)
    .single();

  if (fetchError || !original) {
    throw new Error("Could not find theme to duplicate");
  }

  const baseSlug = `${original.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-copy`;
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { error: insertError } = await supabase.from("themes").insert({
    name: `${original.name} (copy)`,
    slug,
    status: "draft",
    tokens: original.tokens,
    notes: original.notes,
  });

  if (insertError) {
    throw new Error(`Failed to duplicate theme: ${insertError.message}`);
  }

  revalidatePath("/admin/themes");
}

export async function createBlankTheme() {
  const supabase = await createClient();
  const slug = `untitled-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("themes")
    .insert({
      name: "Untitled theme",
      slug,
      status: "draft",
      tokens: {
        font_display: "Outfit",
        font_body: "Outfit",
        colors: {
          dark: "#262323",
          darker: "#111111",
          accent: "#262323",
          accent_soft: "#C4B8AB",
          cream: "#F3F1EE",
          white: "#FFFFFF",
        },
        radius: "pill",
      },
      notes: null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create theme: ${error?.message}`);
  }

  revalidatePath("/admin/themes");
  redirect(`/admin/themes/${data.id}`);
}

export interface SaveThemeResult {
  ok: boolean;
  errors?: string[];
}

/**
 * Saves edits to a draft theme. Validates token shape with Zod (rejects
 * anything outside the allow-listed fonts / hex-colour format) and blocks
 * the save if the colour combination fails WCAG AA contrast — an admin
 * cannot accidentally ship an inaccessible palette.
 */
export async function saveTheme(
  themeId: string,
  formValues: { name: string; notes: string; tokensJson: string }
): Promise<SaveThemeResult> {
  let parsedTokens;
  try {
    parsedTokens = themeTokensSchema.parse(JSON.parse(formValues.tokensJson));
  } catch {
    return { ok: false, errors: ["Invalid theme token data."] };
  }

  const contrastCheck = checkThemeContrast(parsedTokens);
  if (!contrastCheck.passes) {
    return { ok: false, errors: contrastCheck.failures };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("themes")
    .update({
      name: formValues.name,
      notes: formValues.notes || null,
      tokens: parsedTokens,
    })
    .eq("id", themeId)
    .eq("status", "draft"); // RLS already blocks editing published rows; belt & braces

  if (error) {
    return { ok: false, errors: [error.message] };
  }

  revalidatePath("/admin/themes");
  revalidatePath(`/admin/themes/${themeId}`);
  return { ok: true };
}

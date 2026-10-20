import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TYPE_SCALE, themeTokensSchema, type Theme } from "./types";

export const PREVIEW_COOKIE = "iconos_theme_preview";

const FALLBACK_THEME: Theme = {
  id: "fallback",
  name: "Fallback",
  slug: "fallback",
  status: "published",
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
    type_scale: DEFAULT_TYPE_SCALE,
  },
  notes: null,
  updated_at: new Date().toISOString(),
};

export interface ActiveThemeResult {
  theme: Theme;
  isPreview: boolean;
}

/**
 * Resolves which theme a given request should render.
 *
 * - If a valid iconos_theme_preview cookie is present (only ever set for a
 *   signed-in staff session — see admin actions), that theme wins, but ONLY
 *   for that browser. Callers must mark the response `Cache-Control: private,
 *   no-store` whenever isPreview is true, so Cloudflare never caches someone
 *   else's preview.
 * - Otherwise, the single row with status = 'published' is used.
 * - If Supabase is unreachable or no theme is published yet, a safe built-in
 *   fallback is used so the site never renders unstyled.
 */
export async function getActiveTheme(): Promise<ActiveThemeResult> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const previewId = cookieStore.get(PREVIEW_COOKIE)?.value;

  if (previewId) {
    // RLS: only staff can read non-published rows, so this silently returns
    // nothing for a forged cookie from a non-staff session — falls through
    // to the public published theme below.
    const { data } = await supabase
      .from("themes")
      .select("*")
      .eq("id", previewId)
      .maybeSingle();

    const previewTheme = data ? withValidTokens(data as Theme) : null;
    if (previewTheme) {
      return { theme: previewTheme, isPreview: true };
    }
  }

  const { data: published } = await supabase
    .from("themes")
    .select("*")
    .eq("status", "published")
    .maybeSingle();

  const publishedTheme = published ? withValidTokens(published as Theme) : null;
  return { theme: publishedTheme ?? FALLBACK_THEME, isPreview: false };
}

/**
 * Tokens come from the database and end up inside a <style> tag, so they're
 * re-validated on every read rather than trusted. This also fills defaults
 * for fields added after a theme was saved (e.g. type_scale). An invalid
 * theme returns null, and the caller falls back to the built-in theme.
 */
export function withValidTokens(theme: Theme): Theme | null {
  const parsed = themeTokensSchema.safeParse(theme.tokens);
  if (!parsed.success) {
    console.error(`[theme] "${theme.name}" has invalid tokens, using fallback:`, parsed.error.issues);
    return null;
  }
  return { ...theme, tokens: parsed.data };
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "./blog/types";

/**
 * Generates a URL slug from a title, automatically disambiguating against
 * existing rows in `table` (appending -2, -3, ...) since the slug is no
 * longer something the user can type themselves — collisions must resolve
 * silently rather than surface an error the user has no way to fix.
 */
export async function generateUniqueSlug(
  supabase: SupabaseClient,
  table: string,
  title: string,
  excludeId: string
): Promise<string> {
  const base = slugify(title) || "untitled";
  let candidate = base;

  for (let suffix = 2; suffix < 100; suffix++) {
    const { data } = await supabase
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .neq("id", excludeId)
      .maybeSingle();

    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
  }

  // Pathological case (99+ posts with the same title) — fall back to a
  // guaranteed-unique suffix rather than looping further.
  return `${base}-${Date.now().toString(36)}`;
}
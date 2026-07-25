import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify, RESERVED_SLUGS, type PageType, type ParentSection } from "./pages";
 
/**
 * Generates a URL slug from a title, scoped to the correct uniqueness rule
 * for the page's type:
 *  - service/program: unique within parent_section (matches the DB's
 *    partial unique index on (parent_section, slug))
 *  - custom: unique globally among custom pages, and never a reserved
 *    top-level route segment (matches the DB's partial unique index on
 *    (slug) where page_type = 'custom', plus the app-layer RESERVED_SLUGS
 *    check Postgres can't express)
 *
 * A reserved or already-taken candidate is skipped in favour of the next
 * -2/-3/... suffix, same non-blocking auto-disambiguation as blog posts —
 * the admin never sees a hard validation error over this while still
 * drafting from a title.
 */
export async function generateUniquePageSlug(
  supabase: SupabaseClient,
  pageType: PageType,
  parentSection: ParentSection | null,
  title: string,
  excludeId: string
): Promise<string> {
  const base = slugify(title) || "untitled";
  let candidate = base;
 
  for (let suffix = 2; suffix < 100; suffix++) {
    const isReserved =
      pageType === "custom" && (RESERVED_SLUGS as readonly string[]).includes(candidate);
 
    if (!isReserved) {
      let query = supabase.from("pages").select("id").eq("slug", candidate).neq("id", excludeId);
      query =
        pageType === "custom"
          ? query.eq("page_type", "custom")
          : query.eq("parent_section", parentSection as string);
 
      const { data } = await query.maybeSingle();
      if (!data) return candidate;
    }
 
    candidate = `${base}-${suffix}`;
  }
 
  // Pathological case — fall back to a guaranteed-unique suffix.
  return `${base}-${Date.now().toString(36)}`;
}
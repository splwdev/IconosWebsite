import { createClient } from "@/lib/supabase/server";
import type { NavLink } from "./nav";
 
interface SectionPageRow {
  slug: string;
  title: string;
  parent_section: "what-we-do" | "how-we-work";
}
 
interface CustomNavPageRow {
  slug: string;
  title: string;
}
 
export interface PublicNavGroups {
  whatWeDo: NavLink[];
  howWeWork: NavLink[];
  customLinks: NavLink[];
}
 
/**
 * Fetches everything the header nav needs: published Service/Program pages
 * for the two dropdowns, plus published Custom pages that have opted into
 * show_in_nav (rendered as flat top-level links). Called from
 * (site)/layout.tsx and admin/(protected)/layout.tsx on every request —
 * RLS enforces published-only, since every visitor here is anonymous.
 *
 * Fails soft: a query error returns empty arrays rather than throwing.
 * This runs in the root site layout, so a transient Supabase issue
 * throwing here would take down every public page, not just the nav — an
 * empty/partial nav is a far smaller failure than a site-wide 500.
 */
export async function getPublicNavGroups(): Promise<PublicNavGroups> {
  try {
    const supabase = await createClient();
    const [sectionResult, customResult] = await Promise.all([
      supabase
        .from("pages")
        .select("slug, title, parent_section")
        .in("parent_section", ["what-we-do", "how-we-work"])
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      supabase
        .from("pages")
        .select("slug, title")
        .eq("page_type", "custom")
        .eq("status", "published")
        .eq("show_in_nav", true)
        .order("sort_order", { ascending: true }),
    ]);
 
    if (sectionResult.error) {
      console.error("[nav] Failed to load service/program pages:", sectionResult.error.message);
    }
    if (customResult.error) {
      console.error("[nav] Failed to load custom nav pages:", customResult.error.message);
    }
 
    const sectionRows = (sectionResult.data ?? []) as SectionPageRow[];
    const customRows = (customResult.data ?? []) as CustomNavPageRow[];
 
    return {
      whatWeDo: sectionRows
        .filter((r) => r.parent_section === "what-we-do")
        .map((r) => ({ label: r.title, href: `/what-we-do/${r.slug}` })),
      howWeWork: sectionRows
        .filter((r) => r.parent_section === "how-we-work")
        .map((r) => ({ label: r.title, href: `/how-we-work/${r.slug}` })),
      customLinks: customRows.map((r) => ({ label: r.title, href: `/${r.slug}` })),
    };
  } catch (err) {
    console.error("[nav] Unexpected error loading nav pages:", err);
    return { whatWeDo: [], howWeWork: [], customLinks: [] };
  }
}
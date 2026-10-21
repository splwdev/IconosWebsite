import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { LEGAL_PAGES } from "@/lib/content/legal-pages";
import { getPublishedPosts } from "@/lib/blog/posts";
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.iconos-group.com";
 
  // Static entries with no natural "last modified" source of their own —
  // "" (the homepage) is deliberately here rather than pulled from the
  // pages table, since the singleton page_type: 'home' row has no
  // parent_section and no real slug-based URL of its own; it always maps
  // to the root, which this static entry already covers.
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/who-we-are",
    "/what-we-do",
    "/how-we-work",
    "/clients",
    "/work-with-us",
    "/work-with-us/enquiry",
    "/contact",
    "/blog",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
 
  const supabase = await createClient();
  const [{ data: pages }, posts] = await Promise.all([
    supabase
      .from("pages")
      .select("page_type, parent_section, slug, updated_at")
      .eq("status", "published")
      // home and overview pages are already static entries above (/ and
      // /how-we-work etc.); listing them here would duplicate those URLs.
      .not("page_type", "in", "(home,overview)"),
    getPublishedPosts(),
  ]);
 
  // Services and Programs live at /[parent_section]/[slug]; Custom pages
  // live at a bare top-level /[slug]. 'home' is explicitly excluded above
  // (query filter) — it has no parent_section, which would otherwise
  // produce a broken /null/[slug] entry here.
  const pageRoutes: MetadataRoute.Sitemap = (pages ?? []).map((p) => ({
    url: `${base}${p.page_type === "custom" ? `/${p.slug}` : `/${p.parent_section}/${p.slug}`}`,
    lastModified: new Date(p.updated_at),
  }));
 
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }));
 
  // Legal pages are static code, not database rows — no real "last
  // modified" timestamp exists for them, so this falls back to build time
  // for these specifically (unlike everything else above, which now
  // reflects genuine content-change dates).
  const legalRoutes: MetadataRoute.Sitemap = LEGAL_PAGES.map((p) => ({
    url: `${base}/legal/${p.slug}`,
    lastModified: new Date(),
  }));
 
  return [...staticRoutes, ...pageRoutes, ...postRoutes, ...legalRoutes];
}
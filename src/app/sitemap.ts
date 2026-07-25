import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { LEGAL_PAGES } from "@/lib/content/legal-pages";
import { getPublishedPosts } from "@/lib/blog/posts";
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.iconos-group.com";
 
  const staticRoutes = [
    "",
    "/who-we-are",
    "/what-we-do",
    "/how-we-work",
    "/clients",
    "/work-with-us",
    "/contact",
    "/blog",
  ];
 
  const supabase = await createClient();
  const [{ data: pages }, posts] = await Promise.all([
    supabase
      .from("pages")
      .select("page_type, parent_section, slug")
      .eq("status", "published"),
    getPublishedPosts(),
  ]);
 
  // Services and Programs live at /[parent_section]/[slug]; Custom pages
  // (none exist yet, but the sitemap already needs to account for them —
  // the old static version had no way to represent this type at all) live
  // at a bare top-level /[slug].
  const pageRoutes = (pages ?? []).map((p) =>
    p.page_type === "custom" ? `/${p.slug}` : `/${p.parent_section}/${p.slug}`
  );
 
  const dynamicRoutes = [
    ...pageRoutes,
    ...posts.map((p) => `/blog/${p.slug}`),
    ...LEGAL_PAGES.map((p) => `/legal/${p.slug}`),
  ];
 
  return [...staticRoutes, ...dynamicRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
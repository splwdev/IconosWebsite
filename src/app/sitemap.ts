import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/content/services";
import { WORK_PROGRAMS } from "@/lib/content/how-we-work";
import { BLOG_POSTS } from "@/lib/content/blog-posts";
import { LEGAL_PAGES } from "@/lib/content/legal-pages";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const dynamicRoutes = [
    ...SERVICES.map((s) => `/what-we-do/${s.slug}`),
    ...WORK_PROGRAMS.map((p) => `/how-we-work/${p.slug}`),
    ...BLOG_POSTS.map((p) => `/blog/${p.slug}`),
    ...LEGAL_PAGES.map((p) => `/legal/${p.slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}

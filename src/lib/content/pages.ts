import { z } from "zod";
 
export const PAGE_TYPES = ["service", "program", "custom", "home"] as const;
export type PageType = (typeof PAGE_TYPES)[number];
 
export const PARENT_SECTIONS = ["what-we-do", "how-we-work"] as const;
export type ParentSection = (typeof PARENT_SECTIONS)[number];
 
export type PageStatus = "draft" | "published";
 
// Top-level route segments that already exist as static app routes.
// A Custom Page's slug must never collide with any of these — checked
// server-side in the create/update Server Action, since Postgres has no
// visibility into the Next.js route table. Keep this in sync with
// src/app/(site) and src/app/admin's actual top-level folders.
export const RESERVED_SLUGS = [
  "admin",
  "auth",
  "api",
  "contact",
  "blog",
  "who-we-are",
  "what-we-do",
  "how-we-work",
  "clients",
  "work-with-us",
  "legal",
] as const;
 
export const tierSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
});
 
export type PageTier = z.infer<typeof tierSchema>;
 
const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
 
export const pageInputSchema = z
  .object({
    page_type: z.enum(PAGE_TYPES),
    parent_section: z.enum(PARENT_SECTIONS).nullable(),
    slug: z.string().regex(slugPattern, "Lowercase letters, numbers and hyphens only"),
    title: z.string().min(1, "Title is required"),
    tag: z.string().nullable(),
    summary: z.string().min(1, "Summary is required"),
    body: z.string(),
    tiers: z.array(tierSchema).nullable(),
    meta_description: z.string().nullable(),
    featured_image_url: z.string().nullable(),
    sort_order: z.number().int(),
    show_in_nav: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.page_type === "custom") {
      if (data.parent_section !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parent_section"],
          message: "Custom pages must not belong to a section",
        });
      }
      if ((RESERVED_SLUGS as readonly string[]).includes(data.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["slug"],
          message: `"${data.slug}" is a reserved URL and can't be used for a custom page`,
        });
      }
    } else if (data.page_type === "home") {
      // The singleton homepage — routed by page_type, not by slug, so no
      // reserved-slug check applies (its slug value has no routing
      // significance at all, unlike custom pages).
      if (data.parent_section !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parent_section"],
          message: "The homepage must not belong to a section",
        });
      }
      if (data.show_in_nav) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["show_in_nav"],
          message: "The homepage is not part of the header nav",
        });
      }
    } else {
      if (data.parent_section === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parent_section"],
          message: "Service and program pages must belong to a section",
        });
      }
      if (data.show_in_nav) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["show_in_nav"],
          message: "Only custom pages can be added to the nav directly",
        });
      }
    }
 
    if (data.page_type !== "program" && data.tiers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tiers"],
        message: "Only program pages can have tiers",
      });
    }
  });
 
export type PageInput = z.infer<typeof pageInputSchema>;
 
export interface Page {
  id: string;
  page_type: PageType;
  parent_section: ParentSection | null;
  slug: string;
  title: string;
  tag: string | null;
  summary: string;
  body: string;
  tiers: PageTier[] | null;
  meta_description: string | null;
  featured_image_url: string | null;
  status: PageStatus;
  sort_order: number;
  show_in_nav: boolean;
  created_at: string;
  updated_at: string;
}
 
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
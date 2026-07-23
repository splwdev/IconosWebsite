import { z } from "zod";

export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // Markdown
  category: string;
  status: PostStatus;
  featured_image_url: string | null;
  meta_description: string | null;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const postInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  excerpt: z.string().min(1, "Excerpt is required").max(300),
  body: z.string().min(1, "Post body can't be empty"),
  category: z.string().min(1, "Category is required"),
  meta_description: z.string().max(160, "Keep meta descriptions under 160 characters").optional(),
  featured_image_url: z.string().url().nullable().optional(),
});

export type PostInput = z.infer<typeof postInputSchema>;

/** Auto-generates a URL-safe slug from a title; the editor lets staff override it. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

import { z } from "zod";

// `attribution` holds the person's name (it predates the separate role
// line, and renaming the column would break a deploy in progress).
export const testimonialInputSchema = z.object({
  quote: z.string().trim().min(1, "Quote is required"),
  attribution: z.string().trim().min(1, "Name is required"),
  role: z.string().trim().default(""),
  logo_url: z.string().nullable(),
  logo_alt: z.string().nullable(),
  sort_order: z.number().int(),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;

export type TestimonialStatus = "draft" | "published";

export interface TestimonialRow {
  id: string;
  quote: string;
  attribution: string;
  role: string;
  logo_url: string | null;
  logo_alt: string | null;
  status: TestimonialStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Columns the public site needs — used by the homepage section and /clients. */
export const PUBLIC_TESTIMONIAL_COLUMNS = "id, quote, attribution, role, logo_url, logo_alt";

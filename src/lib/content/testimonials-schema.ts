import { z } from "zod";

// `attribution` holds the person's name (it predates the separate role
// line, and renaming the column would break a deploy in progress).
export const testimonialInputSchema = z.object({
  quote: z.string().trim().min(1, "Quote is required"),
  attribution: z.string().trim().min(1, "Name is required"),
  role: z.string().trim().default(""),
  /** Bold line above the quote on the Clients page. Optional. */
  headline: z.string().trim().default(""),
  /** Longer version for the Clients page; the short quote is used when blank. */
  full_quote: z.string().trim().default(""),
  show_on_homepage: z.boolean().default(true),
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
  headline: string;
  full_quote: string;
  show_on_homepage: boolean;
  logo_url: string | null;
  logo_alt: string | null;
  status: TestimonialStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Columns the public site needs — used by the homepage section and /clients. */
export const PUBLIC_TESTIMONIAL_COLUMNS =
  "id, quote, attribution, role, headline, full_quote, show_on_homepage, logo_url, logo_alt";

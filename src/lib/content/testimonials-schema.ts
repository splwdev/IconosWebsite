import { z } from "zod";
 
export const testimonialInputSchema = z.object({
  quote: z.string().min(1, "Quote is required"),
  attribution: z.string().min(1, "Attribution is required"),
  logo_url: z.string().nullable(),
  sort_order: z.number().int(),
});
 
export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
 
export type TestimonialStatus = "draft" | "published";
 
export interface TestimonialRow {
  id: string;
  quote: string;
  attribution: string;
  logo_url: string | null;
  status: TestimonialStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
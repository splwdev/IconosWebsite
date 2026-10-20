import { createClient } from "@/lib/supabase/server";
import { PUBLIC_TESTIMONIAL_COLUMNS } from "./testimonials-schema";

/** Shape the public site renders (TestimonialCard). */
export interface Testimonial {
  id: string;
  quote: string;
  /** The person's name. */
  attribution: string;
  /** Position and company — optional second line. */
  role: string;
  logo_url: string | null;
  logo_alt: string | null;
}

/** A single published testimonial, or null if it doesn't exist or isn't published. */
export async function getPublishedTestimonial(id: string): Promise<Testimonial | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(PUBLIC_TESTIMONIAL_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    console.error("[testimonials] Failed to load one:", error.message);
    return null;
  }
  return (data as Testimonial | null) ?? null;
}

/**
 * Published testimonials in display order. RLS only returns published
 * rows to the public, but the status filter is kept explicit so a signed-in
 * staff member previewing the site doesn't see drafts either.
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(PUBLIC_TESTIMONIAL_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[testimonials] Failed to load:", error.message);
    return [];
  }
  return (data as Testimonial[] | null) ?? [];
}

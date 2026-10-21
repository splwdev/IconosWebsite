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
  /** Bold line above the quote on the Clients page ("" if none). */
  headline: string;
  /** Longer quote for the Clients page ("" means use `quote`). */
  full_quote: string;
  show_on_homepage: boolean;
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
 *
 * homepageOnly: just the ones ticked "Show on homepage" (the short-quote
 * highlights); otherwise all of them (the Clients page).
 */
export async function getPublishedTestimonials(
  options: { homepageOnly?: boolean } = {}
): Promise<Testimonial[]> {
  const supabase = await createClient();
  let query = supabase
    .from("testimonials")
    .select(PUBLIC_TESTIMONIAL_COLUMNS)
    .eq("status", "published");
  if (options.homepageOnly) query = query.eq("show_on_homepage", true);
  const { data, error } = await query.order("sort_order", { ascending: true });

  if (error) {
    console.error("[testimonials] Failed to load:", error.message);
    return [];
  }
  return (data as Testimonial[] | null) ?? [];
}

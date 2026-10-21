"use server";
 
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { testimonialInputSchema, type TestimonialInput } from "@/lib/content/testimonials-schema";
 
export interface SaveTestimonialResult {
  ok: boolean;
  errors?: string[];
}
 
function revalidatePublicPaths() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout"); // homepage testimonials section
  revalidatePath("/clients");
}
 
export async function createBlankTestimonial() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .insert({ quote: "", attribution: "", status: "draft" });
 
  if (error) {
    throw new Error(`Failed to create testimonial: ${error.message}`);
  }
 
  revalidatePath("/admin/testimonials");
}
 
/**
 * Saves current form values and, when options.status is given, changes
 * status in the same update — same "save and publish together" pattern
 * used everywhere else this session, so publishing a testimonial can never
 * accidentally go out with stale or blank content.
 */
export async function saveTestimonial(
  id: string,
  values: TestimonialInput,
  options?: { status?: "draft" | "published" }
): Promise<SaveTestimonialResult> {
  const parsed = testimonialInputSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }
 
  const supabase = await createClient();
 
  const updatePayload: Record<string, unknown> = {
    quote: parsed.data.quote,
    attribution: parsed.data.attribution,
    role: parsed.data.role,
    headline: parsed.data.headline,
    full_quote: parsed.data.full_quote,
    show_on_homepage: parsed.data.show_on_homepage,
    logo_url: parsed.data.logo_url,
    logo_alt: parsed.data.logo_alt,
    sort_order: parsed.data.sort_order,
  };
 
  if (options?.status) {
    updatePayload.status = options.status;
  }
 
  const { error } = await supabase.from("testimonials").update(updatePayload).eq("id", id);
 
  if (error) {
    return { ok: false, errors: [error.message] };
  }
 
  revalidatePublicPaths();
  revalidatePath(`/admin/testimonials/${id}`);
  return { ok: true };
}
 
/** Row-level toggle for the list page — pure status flip, no in-progress form to worry about. */
export async function publishTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").update({ status: "published" }).eq("id", id);
  if (error) throw new Error(`Failed to publish: ${error.message}`);
  revalidatePublicPaths();
}
 
export async function unpublishTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").update({ status: "draft" }).eq("id", id);
  if (error) throw new Error(`Failed to unpublish: ${error.message}`);
  revalidatePublicPaths();
}
 
export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete: ${error.message}`);
  revalidatePublicPaths();
  redirect("/admin/testimonials");
}
 
export interface UploadLogoResult {
  ok: boolean;
  url?: string;
  error?: string;
}
 
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB — logos are small, no reason to allow more
 
/**
 * Reuses the existing blog-images bucket (staff-write/public-read RLS
 * already fits) under a testimonials/ prefix, same reasoning as page
 * images — no new bucket needed just for naming symmetry.
 */
export async function uploadTestimonialLogo(formData: FormData): Promise<UploadLogoResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, WebP or SVG images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Logo must be under 2MB." };
  }
 
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `testimonials/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
 
  const { error } = await supabase.storage.from("blog-images").upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
  });
 
  if (error) {
    return { ok: false, error: error.message };
  }
 
  const { data: publicUrlData } = supabase.storage.from("blog-images").getPublicUrl(path);
  return { ok: true, url: publicUrlData.publicUrl };
}
"use server";
 
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  pageInputSchema,
  slugify,
  type PageInput,
  type PageType,
  type ParentSection,
} from "@/lib/content/pages";
import { generateUniquePageSlug } from "@/lib/content/page-slug";
import { sanitizePostBody } from "@/lib/blog/sanitize";
 
export interface SavePageResult {
  ok: boolean;
  errors?: string[];
}
 
interface PublicPathInfo {
  page_type: PageType;
  parent_section: ParentSection | null;
  slug: string;
}
 
function revalidatePublicPaths(page: PublicPathInfo) {
  revalidatePath("/admin/pages");
  if (page.page_type === "custom") {
    revalidatePath(`/${page.slug}`);
  } else {
    const section = page.parent_section as ParentSection;
    revalidatePath(`/${section}`);
    revalidatePath(`/${section}/${page.slug}`);
  }
  // The header nav renders on every page — a title/slug/publish/
  // show_in_nav change on any page type could affect it (dropdowns for
  // service/program, top-level links for custom pages with show_in_nav
  // enabled), so this always runs regardless of page_type.
  revalidatePath("/", "layout");
}
 
const BLANK_TITLES: Record<PageType, string> = {
  service: "Untitled service",
  program: "Untitled program",
  custom: "Untitled page",
};
 
/**
 * Creates a blank draft and redirects into its editor — same pattern as
 * createBlankPost. No slug uniqueness check needed here (unlike savePage)
 * because the placeholder title + timestamp suffix is already
 * astronomically unlikely to collide; real disambiguation happens on the
 * first real savePage call once the admin sets a real title.
 */
export async function createBlankPage(pageType: PageType, parentSection: ParentSection | null) {
  const supabase = await createClient();
  const title = BLANK_TITLES[pageType];
  const slug = `${slugify(title)}-${Date.now().toString(36)}`;
 
  const { data, error } = await supabase
    .from("pages")
    .insert({
      page_type: pageType,
      parent_section: parentSection,
      slug,
      title,
      summary: "",
      body: "",
      status: "draft",
    })
    .select("id")
    .single();
 
  if (error || !data) {
    throw new Error(`Failed to create page: ${error?.message}`);
  }
 
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${data.id}`);
}
 
/**
 * Saves edits without changing publish status, unless options.status is
 * given — in which case status changes in the *same* update, atomically.
 * This is what the editor's Publish/Unpublish buttons use (see
 * page-editor-form.tsx); the standalone publishPage/unpublishPage below
 * remain a pure status flip for the list page's row-level toggle, where
 * there's no in-progress form whose edits could be silently lost.
 */
export async function savePage(
  pageId: string,
  values: PageInput,
  options?: { status?: "draft" | "published" }
): Promise<SavePageResult> {
  const parsed = pageInputSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }
 
  const supabase = await createClient();
 
  const { data: current } = await supabase
    .from("pages")
    .select("status, page_type, parent_section, slug")
    .eq("id", pageId)
    .single();
 
  if (!current) {
    return { ok: false, errors: ["Page not found."] };
  }
 
  const updatePayload: Record<string, unknown> = {
    title: parsed.data.title,
    tag: parsed.data.tag || null,
    summary: parsed.data.summary,
    body: sanitizePostBody(parsed.data.body),
    tiers: parsed.data.tiers,
    meta_description: parsed.data.meta_description || null,
    featured_image_url: parsed.data.featured_image_url ?? null,
    sort_order: parsed.data.sort_order,
    show_in_nav: parsed.data.show_in_nav,
  };
 
  // Slug only auto-follows the title while still a draft — including on
  // the very save that publishes it, which is the last moment it can
  // still change before locking permanently.
  if (current.status !== "published") {
    updatePayload.slug = await generateUniquePageSlug(
      supabase,
      current.page_type,
      current.parent_section,
      parsed.data.title,
      pageId
    );
  }
 
  if (options?.status === "published" && current.status !== "published") {
    updatePayload.status = "published";
  } else if (options?.status === "draft" && current.status === "published") {
    updatePayload.status = "draft";
  }
 
  const { error } = await supabase.from("pages").update(updatePayload).eq("id", pageId);
 
  if (error) {
    if (error.code === "23505") {
      return { ok: false, errors: ["That URL is already in use."] };
    }
    return { ok: false, errors: [error.message] };
  }
 
  revalidatePublicPaths({
    page_type: current.page_type,
    parent_section: current.parent_section,
    slug: (updatePayload.slug as string | undefined) ?? current.slug,
  });
  revalidatePath(`/admin/pages/${pageId}`);
 
  return { ok: true };
}
 
export async function publishPage(pageId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .update({ status: "published" })
    .eq("id", pageId)
    .select("page_type, parent_section, slug")
    .single();
 
  if (error || !data) throw new Error(`Failed to publish: ${error?.message}`);
  revalidatePublicPaths(data);
}
 
export async function unpublishPage(pageId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .update({ status: "draft" })
    .eq("id", pageId)
    .select("page_type, parent_section, slug")
    .single();
 
  if (error || !data) throw new Error(`Failed to unpublish: ${error?.message}`);
  revalidatePublicPaths(data);
}
 
export async function deletePage(pageId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .delete()
    .eq("id", pageId)
    .select("page_type, parent_section, slug")
    .single();
 
  if (error) throw new Error(`Failed to delete: ${error.message}`);
  if (data) revalidatePublicPaths(data);
 
  redirect("/admin/pages");
}
 
export interface UploadImageResult {
  ok: boolean;
  url?: string;
  error?: string;
}
 
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
 
/**
 * Reuses the existing blog-images bucket (staff-write/public-read RLS
 * already fits) under a pages/ path prefix, rather than provisioning a
 * second bucket purely for naming symmetry.
 */
export async function uploadPageImage(formData: FormData): Promise<UploadImageResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPEG, PNG or WebP images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be under 5MB." };
  }
 
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `pages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
 
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
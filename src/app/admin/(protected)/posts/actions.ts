"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postInputSchema, slugify, type PostInput } from "@/lib/blog/types";
import { sanitizePostBody } from "@/lib/blog/sanitize";
import { generateUniqueSlug } from "@/lib/slug-utils";

export interface SavePostResult {
  ok: boolean;
  errors?: string[];
}

export async function createBlankPost() {
  const supabase = await createClient();
  const title = "Untitled post";
  const slug = `${slugify(title)}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      slug,
      excerpt: "",
      body: "",
      category: "Commercial",
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create post: ${error?.message}`);
  }

  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${data.id}`);
}

/**
 * Saves edits without changing publish status. Validated with Zod
 * server-side (never trust the client form alone) — RLS separately ensures
 * only staff can reach this table at all.
 */
export async function savePost(postId: string, values: PostInput): Promise<SavePostResult> {
  const parsed = postInputSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  const supabase = await createClient();

  // Never trust the client on publish status — it gates whether the slug
  // is allowed to change. Changing a published post's URL silently breaks
  // any links already shared and any SEO already earned on that URL.
  const { data: current } = await supabase
    .from("posts")
    .select("status")
    .eq("id", postId)
    .single();

  const updatePayload: Record<string, unknown> = {
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    body: sanitizePostBody(parsed.data.body),
    category: parsed.data.category,
    meta_description: parsed.data.meta_description || null,
    featured_image_url: parsed.data.featured_image_url ?? null,
  };

  // Slug auto-follows the title only while still a draft (with automatic
  // -2/-3 disambiguation, since the user can no longer type it themselves
  // to fix a collision). Once published, it's frozen entirely.
  if (current?.status !== "published") {
    updatePayload.slug = await generateUniqueSlug(supabase, "posts", parsed.data.title, postId);
  }

  const { error } = await supabase.from("posts").update(updatePayload).eq("id", postId);

  if (error) {
    // Postgres unique_violation on the slug column
    if (error.code === "23505") {
      return { ok: false, errors: ["That slug is already in use by another post."] };
    }
    return { ok: false, errors: [error.message] };
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);
  return { ok: true };
}

export async function publishPost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) throw new Error(`Failed to publish: ${error.message}`);

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/"); // homepage blog teaser
}

export async function unpublishPost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ status: "draft", published_at: null })
    .eq("id", postId);

  if (error) throw new Error(`Failed to unpublish: ${error.message}`);

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw new Error(`Failed to delete: ${error.message}`);

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  redirect("/admin/posts");
}

export interface UploadImageResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Uploads a featured image to the public `blog-images` Storage bucket.
 * Bucket write access is staff-only via storage.objects RLS (see
 * 0002_blog_cms.sql) — this action just performs client-side-adjacent
 * validation (type/size) before handing off to Supabase.
 */
export async function uploadFeaturedImage(formData: FormData): Promise<UploadImageResult> {
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
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

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
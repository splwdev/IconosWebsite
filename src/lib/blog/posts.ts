import { createClient } from "@/lib/supabase/server";
import type { Post } from "./types";

/**
 * Used by public pages (/blog, homepage teaser). RLS ("public reads
 * published posts") is what actually restricts this to published,
 * already-live posts — this function has no elevated access of its own.
 */
export async function getPublishedPosts(limit?: number): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data as Post[]) ?? [];
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return (data as Post) ?? null;
}

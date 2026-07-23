import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/blog/types";
import { PostEditorForm } from "./post-editor-form";

export default async function PostEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();

  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900">Edit post</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Saving here updates the draft. Use Publish from the posts list (or below) to make it live.
      </p>
      <PostEditorForm post={post as Post} />
    </div>
  );
}

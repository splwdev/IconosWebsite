import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/blog/types";
import { publishPost, unpublishPost, createBlankPost } from "./actions";

export default async function AdminPostsPage() {
  const supabase = await createClient();
  // RLS ("staff reads all posts") is what allows drafts to show here.
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Blog posts</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Drafts are only visible here — published posts go live immediately.
          </p>
        </div>
        <form action={createBlankPost}>
          <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
            + New post
          </button>
        </form>
      </div>

      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {(posts as Post[] | null)?.length === 0 && (
          <p className="p-6 text-sm text-neutral-500">No posts yet.</p>
        )}
        {(posts as Post[] | null)?.map((post) => (
          <div key={post.id} className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    post.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {post.status}
                </span>
                <span className="text-xs text-neutral-400">{post.category}</span>
              </div>
              <h2 className="mt-1 truncate font-medium text-neutral-900">{post.title}</h2>
              <p className="text-xs text-neutral-400">/blog/{post.slug}</p>
            </div>

            <div className="flex flex-shrink-0 gap-2 text-sm">
              <Link
                href={`/admin/posts/${post.id}`}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Edit
              </Link>
              {post.status === "published" ? (
                <form action={unpublishPost.bind(null, post.id)}>
                  <button className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50">
                    Unpublish
                  </button>
                </form>
              ) : (
                <form action={publishPost.bind(null, post.id)}>
                  <button className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700">
                    Publish
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

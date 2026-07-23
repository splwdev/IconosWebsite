"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Post } from "@/lib/blog/types";
import { postInputSchema, slugify, type PostInput } from "@/lib/blog/types";
import {
  savePost,
  publishPost,
  unpublishPost,
  deletePost,
  uploadFeaturedImage,
} from "../actions";

const CATEGORIES = ["Corporate", "Commercial", "Data Protection", "IP", "Employment", "M&A"];

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";

export function PostEditorForm({ post }: { post: Post }) {
  const [isSaving, startSaving] = useTransition();
  const [isPublishing, startPublishing] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState(post.featured_image_url);
  const [showPreview, setShowPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(true); // existing posts: don't auto-slug on title edits
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postInputSchema),
    defaultValues: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      category: post.category,
      meta_description: post.meta_description ?? "",
      featured_image_url: post.featured_image_url,
    },
  });

  const bodyValue = watch("body");
  const titleValue = watch("title");

  function handleTitleChange(value: string) {
    setValue("title", value);
    if (!slugTouched) {
      setValue("slug", slugify(value));
    }
  }

  function onSubmit(values: PostInput) {
    setSaveMessage(null);
    startSaving(async () => {
      const result = await savePost(post.id, { ...values, featured_image_url: imageUrl });
      setSaveMessage(
        result.ok
          ? { ok: true, text: "Draft saved." }
          : { ok: false, text: (result.errors ?? ["Something went wrong."]).join(" ") }
      );
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startUploading(async () => {
      const result = await uploadFeaturedImage(formData);
      if (result.ok && result.url) {
        setImageUrl(result.url);
        setValue("featured_image_url", result.url);
      } else {
        setSaveMessage({ ok: false, text: result.error ?? "Upload failed." });
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Title</label>
          <input
            className={inputClass}
            value={titleValue}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            URL slug
            <span className="ml-2 font-normal text-neutral-400">/blog/{watch("slug")}</span>
          </label>
          <input
            className={inputClass}
            {...register("slug")}
            onFocus={() => setSlugTouched(true)}
          />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Category</label>
            <select className={inputClass} {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Excerpt <span className="font-normal text-neutral-400">(shown on the blog index)</span>
          </label>
          <textarea rows={2} className={inputClass} {...register("excerpt")} />
          {errors.excerpt && <p className="mt-1 text-xs text-red-600">{errors.excerpt.message}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700">Body (Markdown)</label>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="text-xs font-medium text-neutral-500 underline"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>
          {showPreview ? (
            <div className="min-h-[280px] rounded-lg border border-neutral-300 bg-neutral-50 p-4 text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {bodyValue || "*Nothing to preview yet.*"}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              rows={14}
              className={`${inputClass} font-mono`}
              {...register("body")}
              placeholder="Write in Markdown — headings, **bold**, lists, links, etc."
            />
          )}
          {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Meta description <span className="font-normal text-neutral-400">(SEO, optional)</span>
          </label>
          <input className={inputClass} {...register("meta_description")} />
          {errors.meta_description && (
            <p className="mt-1 text-xs text-red-600">{errors.meta_description.message}</p>
          )}
        </div>

        {saveMessage && (
          <p className={`text-sm ${saveMessage.ok ? "text-emerald-700" : "text-red-600"}`}>
            {saveMessage.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save draft"}
          </button>

          {post.status === "published" ? (
            <button
              type="button"
              disabled={isPublishing}
              onClick={() => startPublishing(() => unpublishPost(post.id))}
              className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
            >
              {isPublishing ? "Working…" : "Unpublish"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isPublishing}
              onClick={() => startPublishing(() => publishPost(post.id))}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
          )}

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              if (confirm("Delete this post? This can't be undone.")) {
                startDeleting(() => deletePost(post.id));
              }
            }}
            className="ml-auto text-sm font-medium text-red-600 disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete post"}
          </button>
        </div>
      </form>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Featured image</label>
        {imageUrl ? (
          <div className="relative mb-3 aspect-video overflow-hidden rounded-lg border border-neutral-200">
            <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="mb-3 flex aspect-video items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
            No image uploaded
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="text-sm"
          disabled={isUploading}
        />
        {isUploading && <p className="mt-1 text-xs text-neutral-500">Uploading…</p>}
        <p className="mt-2 text-xs text-neutral-400">JPEG, PNG or WebP, up to 5MB.</p>
      </div>
    </div>
  );
}

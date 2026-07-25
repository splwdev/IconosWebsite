"use client";
 
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Page, PageTier } from "@/lib/content/pages";
import { pageInputSchema, slugify, type PageInput } from "@/lib/content/pages";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  savePage,
  deletePage,
  uploadPageImage,
} from "@/app/admin/(protected)/pages/actions";
 
const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
 
const TYPE_LABEL: Record<Page["page_type"], string> = {
  service: "Service",
  program: "Program",
  custom: "Custom page",
};
 
export function PageEditorForm({ page }: { page: Page }) {
  const [isSaving, startSaving] = useTransition();
  const [isPublishing, startPublishing] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
 
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState(page.featured_image_url);
  const [tiers, setTiers] = useState<PageTier[]>(page.tiers ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PageInput>({
    resolver: zodResolver(pageInputSchema),
    defaultValues: {
      page_type: page.page_type,
      parent_section: page.parent_section,
      slug: page.slug,
      title: page.title,
      tag: page.tag ?? "",
      summary: page.summary,
      body: page.body,
      tiers: page.tiers,
      meta_description: page.meta_description ?? "",
      featured_image_url: page.featured_image_url,
      sort_order: page.sort_order,
      show_in_nav: page.show_in_nav,
    },
  });
 
  const titleValue = watch("title");
  const isPublished = page.status === "published";
  const previewSlug = isPublished ? page.slug : slugify(titleValue || "");
  const previewPath =
    page.page_type === "custom" ? `/${previewSlug}` : `/${page.parent_section}/${previewSlug}`;
 
  function addTier() {
    setTiers((t) => [...t, { name: "", description: "" }]);
  }
  function updateTier(index: number, field: keyof PageTier, value: string) {
    setTiers((t) => t.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)));
  }
  function removeTier(index: number) {
    setTiers((t) => t.filter((_, i) => i !== index));
  }
 
  function onSaveDraft(values: PageInput) {
    setSaveMessage(null);
    startSaving(async () => {
      const result = await savePage(page.id, {
        ...values,
        featured_image_url: imageUrl,
        tiers: tiers.length > 0 ? tiers : null,
      });
      setSaveMessage(
        result.ok
          ? { ok: true, text: "Draft saved." }
          : { ok: false, text: (result.errors ?? ["Something went wrong."]).join(" ") }
      );
    });
  }
 
  function onPublish(values: PageInput) {
    setSaveMessage(null);
    startPublishing(async () => {
      const result = await savePage(
        page.id,
        { ...values, featured_image_url: imageUrl, tiers: tiers.length > 0 ? tiers : null },
        { status: "published" }
      );
      setSaveMessage(
        result.ok
          ? { ok: true, text: "Published." }
          : { ok: false, text: (result.errors ?? ["Something went wrong."]).join(" ") }
      );
    });
  }
 
  function onUnpublish(values: PageInput) {
    setSaveMessage(null);
    startPublishing(async () => {
      const result = await savePage(
        page.id,
        { ...values, featured_image_url: imageUrl, tiers: tiers.length > 0 ? tiers : null },
        { status: "draft" }
      );
      setSaveMessage(
        result.ok
          ? { ok: true, text: "Unpublished." }
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
      const result = await uploadPageImage(formData);
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
      <form onSubmit={handleSubmit(onSaveDraft)} className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          <span>{TYPE_LABEL[page.page_type]}</span>
          {page.parent_section && <span>· {page.parent_section}</span>}
        </div>
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Title</label>
          <input className={inputClass} {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">URL</label>
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
            <span className="font-medium text-neutral-700">{previewPath || "…"}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            {isPublished
              ? "Locked now that this page is published, so existing links keep working."
              : "Generated automatically from the title above."}
          </p>
        </div>
 
        {page.page_type === "custom" && (
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4">
            <input
              id="show_in_nav"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-neutral-300"
              {...register("show_in_nav")}
            />
            <label htmlFor="show_in_nav" className="text-sm text-neutral-700">
              <span className="font-medium text-neutral-900">Show in main navigation</span>
              <br />
              <span className="text-neutral-500">
                Adds this page as a top-level link in the header, after &ldquo;Blog&rdquo;.
                Leave unchecked for a page only reachable by direct link (e.g. one shared in
                an email or linked from another page).
              </span>
            </label>
          </div>
        )}
 
        {page.page_type === "program" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Tag{" "}
              <span className="font-normal text-neutral-400">
                (e.g. &ldquo;Subscription&rdquo;, &ldquo;Three tiers&rdquo;)
              </span>
            </label>
            <input className={inputClass} {...register("tag")} />
          </div>
        )}
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Summary{" "}
            <span className="font-normal text-neutral-400">
              (shown on the overview page and in search results)
            </span>
          </label>
          <textarea rows={2} className={inputClass} {...register("summary")} />
          {errors.summary && <p className="mt-1 text-xs text-red-600">{errors.summary.message}</p>}
        </div>
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Page content</label>
          <RichTextEditor
            content={page.body}
            onChange={(html) => setValue("body", html, { shouldValidate: true })}
          />
        </div>
 
        {page.page_type === "program" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-700">
                Pricing tiers <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <button
                type="button"
                onClick={addTier}
                className="text-xs font-medium text-neutral-600 underline"
              >
                + Add tier
              </button>
            </div>
            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <div key={index} className="flex gap-2 rounded-lg border border-neutral-200 p-3">
                  <div className="flex-1 space-y-2">
                    <input
                      className={inputClass}
                      placeholder="Tier name"
                      value={tier.name}
                      onChange={(e) => updateTier(index, "name", e.target.value)}
                    />
                    <textarea
                      rows={2}
                      className={inputClass}
                      placeholder="Description"
                      value={tier.description}
                      onChange={(e) => updateTier(index, "description", e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="self-start text-xs font-medium text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {tiers.length === 0 && (
                <p className="text-xs text-neutral-400">
                  No tiers — this program will show as a simple list.
                </p>
              )}
            </div>
          </div>
        )}
 
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Meta description <span className="font-normal text-neutral-400">(SEO, optional)</span>
          </label>
          <input className={inputClass} {...register("meta_description")} />
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
 
          {page.status === "published" ? (
            <button
              type="button"
              disabled={isPublishing}
              onClick={handleSubmit(onUnpublish)}
              className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
            >
              {isPublishing ? "Working…" : "Unpublish"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isPublishing}
              onClick={handleSubmit(onPublish)}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
          )}
 
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              if (confirm("Delete this page? This can't be undone.")) {
                startDeleting(() => deletePage(page.id));
              }
            }}
            className="ml-auto text-sm font-medium text-red-600 disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete page"}
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
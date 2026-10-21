"use client";
 
import { useState, useTransition } from "react";
import Image from "next/image";
import {
  saveTestimonial,
  uploadTestimonialLogo,
  deleteTestimonial,
} from "@/app/admin/(protected)/testimonials/actions";
import type { TestimonialRow as TestimonialRowType } from "@/lib/content/testimonials-schema";
 
const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
 
export function TestimonialRow({ testimonial }: { testimonial: TestimonialRowType }) {
  const [quote, setQuote] = useState(testimonial.quote);
  const [attribution, setAttribution] = useState(testimonial.attribution);
  const [role, setRole] = useState(testimonial.role ?? "");
  const [headline, setHeadline] = useState(testimonial.headline ?? "");
  const [fullQuote, setFullQuote] = useState(testimonial.full_quote ?? "");
  const [showOnHomepage, setShowOnHomepage] = useState(testimonial.show_on_homepage ?? true);
  const [logoUrl, setLogoUrl] = useState(testimonial.logo_url);
  const [logoAlt, setLogoAlt] = useState(testimonial.logo_alt ?? "");
  const [isSaving, startSaving] = useTransition();
  const [isPublishing, startPublishing] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
 
  const dirty =
    quote !== testimonial.quote ||
    attribution !== testimonial.attribution ||
    role !== (testimonial.role ?? "") ||
    headline !== (testimonial.headline ?? "") ||
    fullQuote !== (testimonial.full_quote ?? "") ||
    showOnHomepage !== (testimonial.show_on_homepage ?? true) ||
    logoUrl !== testimonial.logo_url ||
    logoAlt !== (testimonial.logo_alt ?? "");
 
  function persist(status?: "draft" | "published") {
    setMessage(null);
    const run = status ? startPublishing : startSaving;
    run(async () => {
      const result = await saveTestimonial(
        testimonial.id,
        {
          quote,
          attribution,
          role,
          headline,
          full_quote: fullQuote,
          show_on_homepage: showOnHomepage,
          logo_url: logoUrl,
          logo_alt: logoAlt,
          sort_order: testimonial.sort_order,
        },
        status ? { status } : undefined
      );
      setMessage(
        result.ok
          ? { ok: true, text: status ? (status === "published" ? "Published." : "Unpublished.") : "Saved." }
          : { ok: false, text: (result.errors ?? ["Something went wrong."]).join(" ") }
      );
    });
  }
 
  function handleLogoFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    startUploading(async () => {
      const result = await uploadTestimonialLogo(formData);
      if (result.ok && result.url) {
        setLogoUrl(result.url);
      } else {
        setMessage({ ok: false, text: result.error ?? "Logo upload failed." });
      }
    });
  }
 
  function handleDelete() {
    if (!confirm("Delete this testimonial? This can't be undone.")) return;
    startDeleting(() => deleteTestimonial(testimonial.id));
  }
 
  return (
    <div className="space-y-3 p-5">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            testimonial.status === "published"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {testimonial.status}
        </span>
      </div>
 
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              Short quote <span className="font-normal text-neutral-400">(homepage)</span>
            </label>
            <textarea
              rows={2}
              className={inputClass}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              Headline{" "}
              <span className="font-normal text-neutral-400">
                (optional, Clients page, e.g. &ldquo;Commercial and flexible in their approach.&rdquo;)
              </span>
            </label>
            <input className={inputClass} value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              Full quote{" "}
              <span className="font-normal text-neutral-400">(optional, Clients page — the short quote is used if blank)</span>
            </label>
            <textarea
              rows={4}
              className={inputClass}
              value={fullQuote}
              onChange={(e) => setFullQuote(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Name{" "}
                <span className="font-normal text-neutral-400">(e.g. &ldquo;Ben Stokes&rdquo;)</span>
              </label>
              <input
                className={inputClass}
                value={attribution}
                onChange={(e) => setAttribution(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Position &amp; company{" "}
                <span className="font-normal text-neutral-400">
                  (optional, e.g. &ldquo;Director, Elite Consultancy Group&rdquo;)
                </span>
              </label>
              <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={showOnHomepage}
              onChange={(e) => setShowOnHomepage(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Show on homepage <span className="text-neutral-400">(every published testimonial shows on the Clients page)</span>
          </label>
        </div>
 
        <div className="w-full sm:w-40">
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Logo <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          {logoUrl ? (
            <div className="relative mb-2 flex h-16 w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-2">
              <div className="relative h-full w-full">
                <Image src={logoUrl} alt={logoAlt} fill unoptimized className="object-contain" />
              </div>
            </div>
          ) : (
            <div className="mb-2 flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
              No logo
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoFile(file);
              }}
              className="w-full text-xs"
            />
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl(null)}
                className="text-xs font-medium text-red-600"
              >
                Remove
              </button>
            )}
          </div>
          {isUploading && <p className="mt-1 text-xs text-neutral-500">Uploading…</p>}
          {logoUrl && (
            <input
              className={`${inputClass} mt-2`}
              placeholder="e.g. Acme Ltd logo"
              value={logoAlt}
              onChange={(e) => setLogoAlt(e.target.value)}
            />
          )}
        </div>
      </div>
 
      {message && (
        <p className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
 
      <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
        <button
          type="button"
          disabled={isSaving || !dirty}
          onClick={() => persist()}
          className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
 
        {testimonial.status === "published" ? (
          <button
            type="button"
            disabled={isPublishing}
            onClick={() => persist("draft")}
            className="rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-700 disabled:opacity-50"
          >
            {isPublishing ? "Working…" : "Unpublish"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isPublishing}
            onClick={() => persist("published")}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {isPublishing ? "Publishing…" : "Publish"}
          </button>
        )}
 
        <button
          type="button"
          disabled={isDeleting}
          onClick={handleDelete}
          className="ml-auto font-medium text-red-600 disabled:opacity-50"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
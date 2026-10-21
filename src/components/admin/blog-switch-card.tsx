"use client";

import { useState, useTransition } from "react";
import { setBlogEnabled, type BlogSwitchResult } from "@/app/admin/(protected)/settings/actions";

/** On/off switch for the public Blog, with the number of published posts for context. */
export function BlogSwitchCard({ initialEnabled, publishedCount }: { initialEnabled: boolean; publishedCount: number }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BlogSwitchResult | null>(null);

  function toggle() {
    const next = !enabled;
    if (next && publishedCount < 3 && !confirm(`There ${publishedCount === 1 ? "is" : "are"} only ${publishedCount} published post${publishedCount === 1 ? "" : "s"}. Show the Blog anyway?`)) {
      return;
    }
    startTransition(async () => {
      const r = await setBlogEnabled(next);
      if (r.ok) setEnabled(next);
      setResult(r);
    });
  }

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-brand-dark">Blog</h2>
          <p className="mt-1 text-sm text-neutral-500">
            While it&apos;s off, the Blog is left out of the menu, the homepage and the sitemap, and its pages show
            &ldquo;page not found&rdquo; to the public. Signed-in staff can still preview it at /blog.
          </p>
          <p className="mt-2 text-sm text-neutral-700">
            {publishedCount} published post{publishedCount === 1 ? "" : "s"}.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Show the Blog on the website"
          disabled={isPending}
          onClick={toggle}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            enabled ? "bg-emerald-600" : "bg-neutral-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p className={`mt-3 text-sm font-medium ${enabled ? "text-emerald-700" : "text-neutral-600"}`}>
        {enabled ? "Live on the website" : "Hidden from the public"}
      </p>
      {result && (
        <p role="status" className={`mt-2 text-sm ${result.ok ? "text-emerald-700" : "text-red-600"}`}>
          {result.message}
        </p>
      )}
    </section>
  );
}

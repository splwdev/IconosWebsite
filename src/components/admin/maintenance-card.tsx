"use client";

import { useState, useTransition } from "react";
import { saveMaintenance, type MaintenanceResult } from "@/app/admin/(protected)/settings/actions";
import type { MaintenanceSettings } from "@/lib/settings/maintenance";

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-accent focus:outline-none";

/** Maintenance mode switch with the page's heading and message. */
export function MaintenanceCard({ initial }: { initial: MaintenanceSettings }) {
  const [saved, setSaved] = useState(initial);
  const [heading, setHeading] = useState(initial.heading);
  const [message, setMessage] = useState(initial.message);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<MaintenanceResult | null>(null);

  function save(enabled: boolean) {
    if (
      enabled &&
      !saved.enabled &&
      !confirm("Switch maintenance mode on? Visitors will only see the maintenance page until you switch it off.")
    ) {
      return;
    }
    const next = { enabled, heading, message };
    startTransition(async () => {
      const r = await saveMaintenance(next);
      if (r.ok) setSaved(next);
      setResult(r);
    });
  }

  const textChanged = heading !== saved.heading || message !== saved.message;

  return (
    <section
      className={`rounded-2xl border p-6 shadow-sm ${
        saved.enabled ? "border-amber-400 bg-amber-50" : "border-black/5 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-brand-dark">Maintenance mode</h2>
          <p className="mt-1 text-sm text-neutral-600">
            While it&apos;s on, every page of the website shows the maintenance page below. The admin area and
            sign-in keep working, and signed-in staff still see the full site with a banner. Search engines are told
            the site is temporarily unavailable, so pages aren&apos;t dropped from results.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={saved.enabled}
          aria-label="Maintenance mode"
          disabled={isPending}
          onClick={() => save(!saved.enabled)}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            saved.enabled ? "bg-amber-500" : "bg-neutral-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
              saved.enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p className={`mt-3 text-sm font-semibold ${saved.enabled ? "text-amber-800" : "text-neutral-600"}`}>
        {saved.enabled ? "ON: visitors see the maintenance page" : "Off: the website is live"}
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="maintenance_heading" className="mb-1 block text-sm font-medium text-brand-dark">
            Heading
          </label>
          <input
            id="maintenance_heading"
            className={inputClass}
            value={heading}
            maxLength={120}
            onChange={(e) => setHeading(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="maintenance_message" className="mb-1 block text-sm font-medium text-brand-dark">
            Message{" "}
            <span className="font-normal text-neutral-400">(the contact email and phone are shown underneath)</span>
          </label>
          <textarea
            id="maintenance_message"
            rows={3}
            className={inputClass}
            value={message}
            maxLength={600}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isPending || !textChanged}
            onClick={() => save(saved.enabled)}
            className="rounded-brand bg-brand-dark px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save wording"}
          </button>
          <a
            href="/maintenance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand-dark underline underline-offset-2"
          >
            Preview the maintenance page
          </a>
        </div>
      </div>

      {result && (
        <div role="status" className={`mt-3 text-sm ${result.ok ? "text-emerald-700" : "text-red-600"}`}>
          <p>{result.message}</p>
          {result.errors?.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useState, useTransition } from "react";
import { deleteSubmissionsOlderThan, type DeleteOlderResult } from "@/app/admin/(protected)/contact-submissions/actions";
import { RETENTION_MONTH_OPTIONS } from "@/lib/admin/enquiries";

/** Admin tool for applying an agreed retention period to stored enquiries. */
export function RetentionTool() {
  const [months, setMonths] = useState<number>(12);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<DeleteOlderResult | null>(null);

  function run() {
    if (!confirm(`Delete every enquiry received more than ${months} months ago? This can't be undone.`)) return;
    startTransition(async () => setResult(await deleteSubmissionsOlderThan(months)));
  }

  return (
    <section className="mt-10 rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="font-semibold text-neutral-900">Delete old enquiries</h2>
      <p className="mt-1 text-sm text-neutral-500">
        For your retention period: removes stored enquiries older than the period you choose. The emails already
        sent aren&apos;t affected.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="retention-months" className="text-neutral-700">
          Older than
        </label>
        <select
          id="retention-months"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="rounded-lg border border-neutral-300 px-3 py-2"
        >
          {RETENTION_MONTH_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} months
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={run}
          disabled={isPending}
          className="rounded-lg border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Delete"}
        </button>
      </div>
      {result && (
        <p role="status" className={`mt-3 text-sm ${result.ok ? "text-emerald-700" : "text-red-600"}`}>
          {result.message}
        </p>
      )}
    </section>
  );
}

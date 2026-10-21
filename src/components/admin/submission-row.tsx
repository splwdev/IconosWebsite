"use client";
 
import { useState, useTransition } from "react";
import {
  markSubmissionRead,
  markSubmissionUnread,
  deleteSubmission,
} from "@/app/admin/(protected)/contact-submissions/actions";
import type { ContactSubmission } from "@/lib/content/contact-submissions";
 
export function SubmissionRow({ submission }: { submission: ContactSubmission }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
 
  const isUnread = !submission.read_at;

  // Older submissions predate these fields; blanks are simply skipped.
  const details = [
    { label: "Job title", value: submission.job_title },
    { label: "LinkedIn", value: submission.linkedin_url },
    { label: "Employees", value: submission.company_size },
    { label: "Sector", value: submission.sector },
    ...(submission.service_details ?? []).map((d) => ({ label: d.question, value: d.answer })),
    { label: "Heard about us", value: submission.heard_about },
    { label: "Marketing emails", value: submission.marketing_opt_in ? "Opted in" : "" },
  ].filter((d) => d.value);
 
  function toggleRead() {
    startTransition(() => {
      if (isUnread) markSubmissionRead(submission.id);
      else markSubmissionUnread(submission.id);
    });
  }
 
  function handleDelete() {
    if (!confirm(`Delete the enquiry from ${submission.name}? This can't be undone.`)) return;
    startTransition(() => deleteSubmission(submission.id));
  }
 
  return (
    <div className={`p-5 ${isUnread ? "bg-blue-50/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            {isUnread && <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="Unread" />}
            <span className="font-medium text-neutral-900">{submission.name}</span>
            <span className="text-sm text-neutral-400">· {submission.company}</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {submission.enquiry_type}
            </span>
            {!submission.email_sent && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Email not sent
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            {new Date(submission.created_at).toLocaleString("en-GB")} · {submission.email}
            {submission.phone ? ` · ${submission.phone}` : ""}
          </p>
          {expanded && (
            <div className="mt-3 space-y-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
              {details.length > 0 && (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-[auto_1fr]">
                  {details.map((d) => (
                    <div key={d.label} className="contents">
                      <dt className="text-neutral-500">{d.label}</dt>
                      <dd className="font-medium text-neutral-800">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p className="whitespace-pre-wrap">{submission.message}</p>
            </div>
          )}
        </button>
 
        <div className="flex flex-shrink-0 gap-2 text-sm">
          <button
            type="button"
            disabled={isPending}
            onClick={toggleRead}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            {isUnread ? "Mark read" : "Mark unread"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
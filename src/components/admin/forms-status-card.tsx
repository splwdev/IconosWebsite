"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { sendTestEmail, type FormsStatus, type TestEmailResult } from "@/app/admin/(protected)/settings/actions";

function StatusLine({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <li className="flex items-start gap-3">
      <Icon aria-hidden className={`mt-0.5 h-5 w-5 flex-shrink-0 ${ok ? "text-emerald-600" : "text-amber-600"}`} />
      <div>
        <p className="text-sm font-medium text-brand-dark">
          {label}: <span className={ok ? "text-emerald-700" : "text-amber-700"}>{ok ? "set up" : "not set up"}</span>
        </p>
        <p className="text-xs text-neutral-500">{detail}</p>
      </div>
    </li>
  );
}

/** Shows whether the forms' email and spam check are configured, with a test-email button. */
export function FormsStatusCard({ status }: { status: FormsStatus }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<TestEmailResult | null>(null);

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-dark">Form setup</h2>
      <p className="mt-1 text-sm text-neutral-500">
        These are set in Cloudflare by your development team. Enquiries are always saved in Enquiries, even if
        email isn&apos;t working.
      </p>
      <ul className="mt-5 space-y-4">
        <StatusLine
          ok={status.emailConfigured}
          label="Email sending (Microsoft 365)"
          detail={
            status.emailConfigured
              ? `Emails are sent from ${status.senderMailbox}.`
              : "Enquiry and confirmation emails won't send until the Microsoft 365 app details are added."
          }
        />
        <StatusLine
          ok={status.turnstileConfigured}
          label="Spam check (Cloudflare Turnstile)"
          detail={
            status.turnstileConfigured
              ? "Visitors are checked before a form can be sent."
              : "Without it, the forms' Send buttons stay disabled on the live site."
          }
        />
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-black/5 pt-5">
        <button
          type="button"
          disabled={isPending || !status.emailConfigured}
          onClick={() => startTransition(async () => setResult(await sendTestEmail()))}
          className="rounded-brand border border-brand-dark px-5 py-2 text-sm font-semibold text-brand-dark disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Send test email"}
        </button>
        <span className="text-xs text-neutral-500">Sends to the recipient address(es) saved below.</span>
      </div>
      {result && (
        <p role="status" className={`mt-3 text-sm ${result.ok ? "text-emerald-700" : "text-red-600"}`}>
          {result.message}
        </p>
      )}
    </section>
  );
}

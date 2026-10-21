import type { ReactNode } from "react";

/**
 * Sidebar beside the enquiry forms: a dark "What happens next" panel, a
 * direct-contact card, and optional extra cards (children).
 */
export function EnquirySidebar({
  steps,
  email,
  phone,
  children,
}: {
  steps: readonly { title: string; body: string }[];
  email: string;
  phone: string;
  children?: ReactNode;
}) {
  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : "";
  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start" aria-label="About your enquiry">
      {steps.length > 0 && (
        <div className="rounded-2xl bg-brand-dark p-6 text-white sm:p-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">What happens next</h2>
          <ol className="mt-5 space-y-5">
            {steps.map((step, i) => (
              <li key={`${i}-${step.title}`} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/70 text-xs font-semibold"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  {step.body && <p className="mt-1 text-sm text-white/75">{step.body}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark/70">
          Prefer to get in touch directly?
        </h2>
        <ul className="mt-4 space-y-2 text-sm font-medium text-brand-dark">
          <li>
            <a href={`mailto:${email}`} className="underline underline-offset-2">
              {email}
            </a>
          </li>
          {telHref && (
            <li>
              <a href={telHref} className="underline underline-offset-2">
                {phone}
              </a>
            </li>
          )}
        </ul>
      </div>

      {children}
    </aside>
  );
}

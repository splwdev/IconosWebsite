import { Check, X } from "lucide-react";
import type { ComparisonSectionContent } from "@/lib/content/page-sections";
import { SectionEyebrow, SectionTitle, mutedText } from "./section-primitives";

/**
 * Two options side by side; the right-hand column is the highlighted one
 * (e.g. "An in-house hire" vs "Iconos Managed Legal Services"). The column
 * titles carry the meaning, so the cross/check icons are decorative.
 */
export function ComparisonSection({ content }: { content: ComparisonSectionContent }) {
  const { eyebrow, heading, left, right } = content;

  return (
    <div>
      <div className="max-w-4xl">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <SectionTitle>{heading}</SectionTitle>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-brand-cream p-6 sm:p-7">
          {left.title && <h3 className="text-h4 font-semibold text-brand-dark">{left.title}</h3>}
          <ul className="mt-3 divide-y divide-brand-dark/10">
            {left.items.map((item) => (
              <li key={item} className={`flex items-start gap-3 py-3 text-small ${mutedText}`}>
                <span
                  aria-hidden
                  className="mt-[0.2em] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-brand-dark/40"
                >
                  <X className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-brand-dark p-6 text-white sm:p-7">
          {right.title && <h3 className="text-h4 font-semibold">{right.title}</h3>}
          <ul className="mt-3 divide-y divide-white/15">
            {right.items.map((item) => (
              <li key={item} className="flex items-start gap-3 py-3 text-small font-medium">
                <span
                  aria-hidden
                  className="mt-[0.2em] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-brand-dark"
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

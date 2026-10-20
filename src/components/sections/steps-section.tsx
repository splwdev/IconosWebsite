import type { StepsSectionContent } from "@/lib/content/page-sections";
import { SectionEyebrow, SectionTitle, mutedText } from "./section-primitives";

/**
 * Numbered process cards ("01 An initial conversation" …). An ordered list,
 * so screen readers announce the sequence; the visible "01" labels are
 * decorative duplicates of that numbering.
 */
export function StepsSection({ content, onTint }: { content: StepsSectionContent; onTint: boolean }) {
  const { eyebrow, heading, intro, items } = content;
  const cardBg = onTint ? "bg-white" : "bg-brand-cream";

  return (
    <div>
      <div className="max-w-4xl">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <SectionTitle>{heading}</SectionTitle>
        {intro && <p className={`mt-3 text-lead ${mutedText}`}>{intro}</p>}
      </div>
      {items.length > 0 && (
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li key={`${i}-${item.title}`} className={`rounded-2xl p-6 ${cardBg}`}>
              <span aria-hidden className={`block text-xs font-medium tabular-nums ${mutedText}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-h4 font-semibold text-brand-dark">{item.title}</h3>
              {item.body && <p className={`mt-2 text-small ${mutedText}`}>{item.body}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

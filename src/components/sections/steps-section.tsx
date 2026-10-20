import type { StepsSectionContent } from "@/lib/content/page-sections";
import { SectionEyebrow, SectionTitle, mutedText } from "./section-primitives";

/**
 * Card grid. Numbered: process cards ("01 An initial conversation" …) as an
 * ordered list, so screen readers announce the sequence; the visible "01"
 * labels are decorative duplicates of that numbering. Un-numbered: a plain
 * list of benefit cards ("What you get").
 */
export function StepsSection({ content, onTint }: { content: StepsSectionContent; onTint: boolean }) {
  const { eyebrow, heading, intro, items, numbered, columns } = content;
  const cardBg = onTint ? "bg-white" : "bg-brand-cream";
  const List = numbered ? "ol" : "ul";
  const gridCols = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div>
      <div className="max-w-4xl">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <SectionTitle>{heading}</SectionTitle>
        {intro && <p className={`mt-3 text-lead ${mutedText}`}>{intro}</p>}
      </div>
      {items.length > 0 && (
        <List className={`mt-8 grid gap-3 ${gridCols}`}>
          {items.map((item, i) => (
            <li key={`${i}-${item.title}`} className={`rounded-2xl p-6 ${cardBg}`}>
              {numbered && (
                <span aria-hidden className={`mb-2 block text-xs font-medium tabular-nums ${mutedText}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <h3 className="text-h4 font-semibold text-brand-dark">{item.title}</h3>
              {item.body && <p className={`mt-2 text-small ${mutedText}`}>{item.body}</p>}
            </li>
          ))}
        </List>
      )}
    </div>
  );
}

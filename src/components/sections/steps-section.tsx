import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StepsSectionContent } from "@/lib/content/page-sections";
import { SectionEyebrow, SectionTitle, mutedText } from "./section-primitives";

/**
 * Card grid. Numbered: process cards ("01 An initial conversation" …) as an
 * ordered list, so screen readers announce the sequence; the visible "01"
 * labels are decorative duplicates of that numbering. Un-numbered: a plain
 * list of benefit cards ("What you get").
 */
export function StepsSection({ content, onTint }: { content: StepsSectionContent; onTint: boolean }) {
  const { eyebrow, heading, intro, items, numbered, columns, final_card } = content;
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
          {final_card.title && (
            <li className="rounded-2xl bg-brand-dark p-6 text-white">
              <h3 className="text-h4 font-semibold">{final_card.title}</h3>
              {final_card.body && <p className="mt-2 text-small text-white/80">{final_card.body}</p>}
              {final_card.link_label && final_card.link_href && (
                <Link
                  href={final_card.link_href}
                  className="mt-4 inline-flex items-center gap-1 text-small font-semibold text-white underline-offset-4 hover:underline"
                >
                  {final_card.link_label}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              )}
            </li>
          )}
        </List>
      )}
    </div>
  );
}

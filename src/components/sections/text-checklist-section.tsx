import type { TextChecklistSectionContent } from "@/lib/content/page-sections";
import { mutedText } from "./section-primitives";

/** Lead paragraph(s) beside a bordered checklist card ("Ideal if…"). */
export function TextChecklistSection({ content }: { content: TextChecklistSectionContent }) {
  const paragraphs = content.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasList = content.items.length > 0;

  return (
    <div className={`grid items-center gap-8 ${hasList ? "md:grid-cols-[3fr_2fr] md:gap-12" : ""}`}>
      <div className="max-w-2xl space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-lead text-brand-dark">
            {p}
          </p>
        ))}
      </div>
      {hasList && (
        <aside className="rounded-2xl bg-white p-6 ring-1 ring-brand-dark/10">
          {content.list_label && (
            <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.18em] ${mutedText}`}>
              {content.list_label}
            </p>
          )}
          <ul className="space-y-2 text-small font-medium text-brand-dark">
            {content.items.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-dark" />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

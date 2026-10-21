import Link from "next/link";
import type { TextChecklistSectionContent } from "@/lib/content/page-sections";
import { ButtonLink, mutedText } from "./section-primitives";

/** Lead paragraph(s) beside a bordered checklist card ("Ideal if…"). */
export function TextChecklistSection({ content }: { content: TextChecklistSectionContent }) {
  const paragraphs = content.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasList = content.items.length > 0;

  return (
    <div className={`grid items-center gap-8 ${hasList ? "md:grid-cols-[3fr_2fr] md:gap-12" : ""}`}>
      <div className="max-w-2xl">
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lead text-brand-dark">
              {p}
            </p>
          ))}
        </div>
        {content.button_label && content.button_href && (
          <ButtonLink href={content.button_href} className="mt-6">
            {content.button_label}
          </ButtonLink>
        )}
        {(content.note || (content.note_link_label && content.note_link_href)) && (
          <p className={`mt-5 text-small ${mutedText}`}>
            {content.note}
            {content.note_link_label && content.note_link_href && (
              <>
                {content.note ? " " : ""}
                <Link
                  href={content.note_link_href}
                  className="font-semibold text-brand-dark underline underline-offset-4 hover:no-underline"
                >
                  {content.note_link_label}
                </Link>
              </>
            )}
            {content.note_after && (/^[.,;:!?)]/.test(content.note_after) ? "" : " ")}
            {content.note_after}
          </p>
        )}
      </div>
      {hasList && (
        <aside className="rounded-2xl bg-white p-6 ring-1 ring-brand-dark/10">
          {content.list_label && (
            <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.18em] ${mutedText}`}>
              {content.list_label}
            </p>
          )}
          <ul
            className={`text-small font-medium text-brand-dark ${
              content.divided ? "divide-y divide-brand-dark/10" : "space-y-2"
            }`}
          >
            {content.items.map((item) => (
              <li key={item} className={`flex gap-2.5 ${content.divided ? "py-2.5 first:pt-0 last:pb-0" : ""}`}>
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

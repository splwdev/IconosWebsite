import { Check } from "lucide-react";
import type { CalloutSectionContent } from "@/lib/content/page-sections";
import { ButtonLink, SectionTitle, mutedText } from "./section-primitives";

/** Outlined feature panel with optional info boxes alongside, e.g. "Data protection training". */
export function CalloutSection({ content }: { content: CalloutSectionContent }) {
  const { anchor, badge, heading, body, note, button_label, button_href, boxes } = content;
  const hasBoxes = boxes.length > 0;

  return (
    <div
      id={anchor || undefined}
      className={`grid scroll-mt-6 gap-8 rounded-3xl border border-brand-dark/80 p-6 sm:p-10 ${
        hasBoxes ? "md:grid-cols-[3fr_2fr] md:gap-12" : ""
      }`}
    >
      <div className="flex flex-col">
        {badge && (
          <p className="mb-4 w-fit rounded-brand bg-brand-dark px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white">
            {badge}
          </p>
        )}
        <SectionTitle>{heading}</SectionTitle>
        {body && <p className="mt-4 max-w-2xl text-body text-brand-dark/80">{body}</p>}
        {note && <p className={`mt-3 max-w-2xl text-small ${mutedText}`}>{note}</p>}
        {button_label && button_href && (
          <div className="mt-auto pt-8">
            <ButtonLink href={button_href}>{button_label}</ButtonLink>
          </div>
        )}
      </div>
      {hasBoxes && (
        <div className="space-y-3">
          {boxes.map((box, i) => (
            <div key={`${i}-${box.label}`} className="rounded-2xl bg-brand-cream p-5">
              {box.label && (
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${mutedText}`}>{box.label}</p>
              )}
              {box.items.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {box.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-small text-brand-dark">
                      <span
                        aria-hidden
                        className="mt-[0.25em] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-dark text-white"
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {box.text && <p className="mt-3 text-small text-brand-dark/80">{box.text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

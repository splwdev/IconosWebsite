import { Check } from "lucide-react";
import type { IssuesSectionContent } from "@/lib/content/page-sections";
import { ButtonLink, SectionEyebrow, SectionImage, SectionTitle } from "./section-primitives";

function IssueChip({ label, tone }: { label: string; tone: "dark" | "light" }) {
  return (
    <li
      className={`flex items-center gap-2.5 rounded-brand py-2 pl-2 pr-4 text-sm font-medium ${
        tone === "dark" ? "bg-brand-dark text-white" : "bg-brand-accent-soft/40 text-brand-dark"
      }`}
    >
      <span
        aria-hidden
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          tone === "dark" ? "bg-white text-brand-dark" : "bg-brand-dark text-white"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      {label}
    </li>
  );
}

/** "Legal issues we help you resolve": image + two columns of issue chips. */
export function IssuesSection({ content }: { content: IssuesSectionContent }) {
  const {
    eyebrow,
    heading,
    image_url,
    image_alt,
    primary_items,
    secondary_items,
    tagline,
    button_label,
    button_href,
  } = content;

  return (
    <div className="grid items-center gap-8 md:grid-cols-[5fr_7fr] md:gap-10">
      <SectionImage src={image_url} alt={image_alt} className="aspect-[3/2]" />
      <div>
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <SectionTitle>{heading}</SectionTitle>
        {(primary_items.length > 0 || secondary_items.length > 0) && (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {primary_items.length > 0 && (
              <ul className="grid content-start gap-2">
                {primary_items.map((item) => (
                  <IssueChip key={item} label={item} tone="dark" />
                ))}
              </ul>
            )}
            {secondary_items.length > 0 && (
              <ul className="grid content-start gap-2">
                {secondary_items.map((item) => (
                  <IssueChip key={item} label={item} tone="light" />
                ))}
              </ul>
            )}
          </div>
        )}
        {tagline && <p className="mt-6 text-body font-semibold text-brand-dark">{tagline}</p>}
        {button_label && button_href && (
          <ButtonLink href={button_href} className="mt-4">
            {button_label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

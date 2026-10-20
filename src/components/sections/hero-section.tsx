import type { HeroCard, HeroSectionContent } from "@/lib/content/page-sections";
import { ButtonLink, SectionImage, mutedText } from "./section-primitives";

function HeroCardBlock({ card }: { card: HeroCard }) {
  return (
    <article
      className={`flex flex-col rounded-2xl bg-white p-6 sm:p-7 ${
        card.wide ? "gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between" : ""
      }`}
    >
      <div className={card.wide ? "max-w-2xl" : ""}>
        {card.eyebrow && (
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${mutedText}`}>
            {card.eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-h3 font-medium text-brand-dark">{card.title}</h2>
        {card.summary && <p className={`mt-1.5 text-body ${mutedText}`}>{card.summary}</p>}
        {card.points.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm font-medium text-brand-dark">
            {card.points.map((point) => (
              <li key={point} className="flex gap-2.5">
                <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-dark" />
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
      {card.button_href && card.button_label && (
        <div className={card.wide ? "shrink-0" : "mt-auto pt-6"}>
          <ButtonLink href={card.button_href} srContext={`about ${card.title}`}>
            {card.button_label}
          </ButtonLink>
        </div>
      )}
    </article>
  );
}

/**
 * Homepage hero: H1 + lead + image, then service cards and an optional
 * centred footnote link (e.g. ad hoc work). Renders inside the tinted
 * wrapper from PageSectionsRenderer when background = "tint".
 */
export function HeroSection({ content }: { content: HeroSectionContent }) {
  const { heading, lead, image_url, image_alt, cards, footnote, footnote_link_label, footnote_link_href } =
    content;

  return (
    <div>
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <h1 className="text-balance text-h1 font-semibold tracking-tight text-brand-dark">
            {heading}
          </h1>
          {lead && <p className={`mt-5 max-w-md text-lead ${mutedText}`}>{lead}</p>}
        </div>
        <SectionImage src={image_url} alt={image_alt} priority className="aspect-[3/2]" />
      </div>

      {cards.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <HeroCardBlock key={card.title} card={card} />
          ))}
        </div>
      )}

      {(footnote || (footnote_link_label && footnote_link_href)) && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          {footnote && <p className={`text-sm ${mutedText}`}>{footnote}</p>}
          {footnote_link_label && footnote_link_href && (
            <ButtonLink href={footnote_link_href} variant="outline" size="sm">
              {footnote_link_label}
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}


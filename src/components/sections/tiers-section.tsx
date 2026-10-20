import { Check } from "lucide-react";
import type { TiersSectionContent } from "@/lib/content/page-sections";
import { ButtonLink, SectionEyebrow, SectionTitle, mutedText } from "./section-primitives";

/**
 * Pricing tier cards. Every part after the name and description is
 * optional, so tier sections saved before prices/features existed still
 * render as simple name + description cards.
 */
export function TiersSection({ content, onTint }: { content: TiersSectionContent; onTint: boolean }) {
  const { eyebrow, heading, tiers } = content;
  if (tiers.length === 0) return null;
  const cardBg = onTint ? "bg-white" : "bg-brand-cream";

  return (
    <div>
      {(eyebrow || heading) && (
        <div className="mb-8 max-w-4xl">
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <SectionTitle>{heading}</SectionTitle>
        </div>
      )}
      <ul className={`grid gap-4 ${tiers.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {tiers.map((tier) => (
          <li key={tier.name} className={`flex flex-col rounded-2xl p-6 sm:p-7 ${cardBg}`}>
            <h3 className="text-h3 font-medium text-brand-dark">{tier.name}</h3>
            {tier.description && <p className={`mt-2 text-small ${mutedText}`}>{tier.description}</p>}

            {tier.price && (
              <p className="mt-5 border-t border-brand-dark/10 pt-5 text-brand-dark">
                <span className="text-h3 font-semibold">{tier.price}</span>
                {tier.price_note && <span className={`ml-1 text-xs ${mutedText}`}>{tier.price_note}</span>}
              </p>
            )}

            {tier.features.length > 0 && (
              <div className="mt-5 border-t border-brand-dark/10 pt-5">
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${mutedText}`}>What&apos;s included</p>
                {tier.features_intro && (
                  <p className="mt-2 text-small font-semibold text-brand-dark">{tier.features_intro}</p>
                )}
                <ul className="mt-2 space-y-1.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-small text-brand-dark">
                      <span
                        aria-hidden
                        className="mt-[0.25em] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-dark text-white"
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tier.button_label && tier.button_href && (
              <div className="mt-auto pt-7">
                <ButtonLink href={tier.button_href}>{tier.button_label}</ButtonLink>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { TestimonialCard } from "@/components/testimonial-card";
import type { TestimonialSpotlightSectionContent } from "@/lib/content/page-sections";
import { getPublishedTestimonial } from "@/lib/content/testimonials";
import { ButtonLink } from "./section-primitives";

/**
 * One testimonial with optional text and a button beside it. With no
 * testimonial selected, an optional placeholder box holds the space (e.g.
 * "[Client testimonial, to follow]") — replace it before launch.
 */
export async function TestimonialSpotlightSection({
  content,
  onTint,
}: {
  content: TestimonialSpotlightSectionContent;
  onTint: boolean;
}) {
  const testimonial = content.testimonial_id ? await getPublishedTestimonial(content.testimonial_id) : null;
  const hasButton = Boolean(content.button_label && content.button_href);
  const showPlaceholder = !testimonial && !content.testimonial_id && Boolean(content.placeholder_text);
  const hasAside = hasButton || Boolean(content.text) || Boolean(content.heading);
  if (!testimonial && !showPlaceholder && !hasAside) return null;

  return (
    <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
      {testimonial && <TestimonialCard {...testimonial} onTint={onTint} />}
      {showPlaceholder && (
        <div
          className={`flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-brand-dark/40 p-6 text-center text-small ${
            onTint ? "bg-white" : "bg-brand-accent-soft/30"
          } text-brand-dark/75`}
        >
          {content.placeholder_text}
        </div>
      )}
      {hasAside && (
        <div>
          {content.heading && <h2 className="text-h4 font-semibold text-brand-dark">{content.heading}</h2>}
          {content.text && (
            <p className={`max-w-md text-body text-brand-dark ${content.heading ? "mt-1" : ""}`}>{content.text}</p>
          )}
          {hasButton && (
            <ButtonLink href={content.button_href} className={content.text || content.heading ? "mt-4" : ""}>
              {content.button_label}
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}

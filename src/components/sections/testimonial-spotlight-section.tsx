import { TestimonialCard } from "@/components/testimonial-card";
import type { TestimonialSpotlightSectionContent } from "@/lib/content/page-sections";
import { getPublishedTestimonial } from "@/lib/content/testimonials";
import { ButtonLink } from "./section-primitives";

/** One testimonial with an optional button beside it. */
export async function TestimonialSpotlightSection({
  content,
  onTint,
}: {
  content: TestimonialSpotlightSectionContent;
  onTint: boolean;
}) {
  const testimonial = content.testimonial_id ? await getPublishedTestimonial(content.testimonial_id) : null;
  const hasButton = Boolean(content.button_label && content.button_href);
  if (!testimonial && !hasButton) return null;

  return (
    <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
      {testimonial && <TestimonialCard {...testimonial} onTint={onTint} />}
      {hasButton && (
        <div>
          <ButtonLink href={content.button_href}>{content.button_label}</ButtonLink>
        </div>
      )}
    </div>
  );
}

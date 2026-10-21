import Image from "next/image";
import type { Testimonial } from "@/lib/content/testimonials";

type TestimonialCardProps = Pick<Testimonial, "quote" | "attribution" | "role" | "logo_url" | "logo_alt"> & {
  onTint?: boolean;
};

/**
 * Byline is two lines per the approved mockup: name (semibold), then
 * position and company (smaller, muted).
 *
 * No star ratings: the old "★★★★★" row implied a review score that doesn't
 * exist, which is misleading publicity under the SRA Code of Conduct.
 */
export function TestimonialCard({ quote, attribution, role, logo_url, logo_alt, onTint = false }: TestimonialCardProps) {
  return (
    <figure className={`flex h-full flex-col rounded-2xl p-6 ${onTint ? "bg-white" : "bg-brand-cream"}`}>
      {logo_url && (
        <div className="relative mb-4 h-8 w-28">
          <Image src={logo_url} alt={logo_alt || ""} fill unoptimized className="object-contain object-left" />
        </div>
      )}
      <blockquote className="flex-1">
        <p className="text-body text-brand-dark">&ldquo;{quote}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-6">
        <span className="block text-sm font-semibold text-brand-dark">{attribution}</span>
        {role && <span className="mt-0.5 block text-xs text-brand-dark/75">{role}</span>}
      </figcaption>
    </figure>
  );
}

type TestimonialFullCardProps = Pick<
  Testimonial,
  "quote" | "full_quote" | "headline" | "attribution" | "role" | "logo_url" | "logo_alt"
> & {
  onTint?: boolean;
};

/**
 * Clients page card: headline, then the full quote, then the byline with
 * the logo underneath. A short testimonial with no headline ("Our money
 * well spent with you!") is shown as the headline itself, in quote marks.
 * No star ratings, for the same reason as TestimonialCard.
 */
export function TestimonialFullCard({
  quote,
  full_quote,
  headline,
  attribution,
  role,
  logo_url,
  logo_alt,
  onTint = false,
}: TestimonialFullCardProps) {
  const body = full_quote || quote;
  return (
    <figure className={`flex h-full flex-col rounded-2xl p-6 sm:p-8 ${onTint ? "bg-white" : "bg-brand-cream"}`}>
      <blockquote className="flex-1">
        {headline ? (
          <>
            <p className="text-h4 font-semibold leading-snug text-brand-dark">{headline}</p>
            <p className="mt-4 text-small leading-relaxed text-brand-dark/75">&ldquo;{body}&rdquo;</p>
          </>
        ) : (
          <p className="text-h4 font-semibold leading-snug text-brand-dark">&ldquo;{body}&rdquo;</p>
        )}
      </blockquote>
      <figcaption className="mt-6">
        <span className="block text-sm font-semibold text-brand-dark">{attribution}</span>
        {role && <span className="mt-0.5 block text-xs text-brand-dark/75">{role}</span>}
        {logo_url && (
          <span className="relative mt-4 block h-8 w-32">
            <Image src={logo_url} alt={logo_alt || ""} fill unoptimized className="object-contain object-left" />
          </span>
        )}
      </figcaption>
    </figure>
  );
}

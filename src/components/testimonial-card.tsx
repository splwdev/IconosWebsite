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

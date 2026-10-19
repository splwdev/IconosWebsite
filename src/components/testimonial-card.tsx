import Image from "next/image";
import type { Testimonial } from "@/lib/content/testimonials";

/**
 * No star ratings: the old "★★★★★" row implied a review score that doesn't
 * exist, which is misleading publicity under the SRA Code of Conduct.
 * Real ratings (e.g. ReviewSolicitors, per questionnaire Q27) can be added
 * once Iconos signs up.
 */
export function TestimonialCard({
  quote,
  attribution,
  logo_url,
  logo_alt,
  onTint = false,
}: Testimonial & { onTint?: boolean }) {
  return (
    <figure className={`flex h-full flex-col rounded-2xl p-6 ${onTint ? "bg-white" : "bg-brand-cream"}`}>
      {logo_url && (
        <div className="relative mb-4 h-8 w-28">
          <Image src={logo_url} alt={logo_alt || ""} fill unoptimized className="object-contain object-left" />
        </div>
      )}
      <blockquote className="flex-1">
        <p className="text-[15px] leading-relaxed text-brand-dark">&ldquo;{quote}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-6 text-sm font-semibold text-brand-dark">{attribution}</figcaption>
    </figure>
  );
}

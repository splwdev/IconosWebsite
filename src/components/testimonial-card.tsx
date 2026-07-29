import Image from "next/image";
import type { Testimonial } from "@/lib/content/testimonials";
 
export function TestimonialCard({ quote, attribution, logo_url, logo_alt }: Testimonial) {
  return (
    <div className="rounded-2xl bg-brand-cream p-7">
      {logo_url ? (
        <div className="relative mb-3 h-8 w-28">
          <Image
            src={logo_url}
            alt={logo_alt || ""}
            fill
            unoptimized
            className="object-contain object-left"
          />
        </div>
      ) : (
        <p className="mb-1 text-sm tracking-widest text-brand-accent" aria-hidden>
          ★★★★★
        </p>
      )}
      <p className="text-[15px] leading-relaxed text-neutral-700">&ldquo;{quote}&rdquo;</p>
      <p className="mt-4 text-sm font-semibold text-brand-dark">{attribution}</p>
    </div>
  );
}
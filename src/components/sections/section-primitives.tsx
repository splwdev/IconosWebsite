import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared building blocks for page sections (homepage redesign, Oct 2026).
 * All colours come from theme tokens (bg-brand-*, rounded-brand) so the
 * admin theme switcher keeps working. Muted text uses brand-dark at reduced
 * opacity rather than fixed greys: neutral-500 fails WCAG AA on the cream
 * tint, brand-dark/75 passes on both white and cream.
 */

export const mutedText = "text-brand-dark/75";

export function SectionEyebrow({ children, tone = "dark" }: { children: string; tone?: "dark" | "light" }) {
  if (!children) return null;
  return (
    <p
      className={`mb-3 text-xs font-semibold uppercase tracking-[0.18em] ${
        tone === "dark" ? "text-brand-accent" : "text-white/70"
      }`}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  tone = "dark",
  as: Tag = "h2",
}: {
  children: string;
  tone?: "dark" | "light";
  as?: "h1" | "h2";
}) {
  if (!children) return null;
  return (
    <Tag
      className={`text-balance text-h2 font-semibold tracking-tight ${
        tone === "dark" ? "text-brand-dark" : "text-white"
      }`}
    >
      {children}
    </Tag>
  );
}

type ButtonVariant = "solid" | "outline" | "inverse";

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  solid: "bg-brand-dark text-white hover:bg-brand-darker",
  outline: "border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white",
  inverse: "bg-white text-brand-dark hover:bg-brand-cream",
};

/**
 * Pill/rounded button link (shape follows the theme's radius token).
 * `srContext` appends screen-reader-only text so repeated "Learn more"
 * labels stay distinguishable (WCAG 2.4.4).
 */
export function ButtonLink({
  href,
  children,
  variant = "solid",
  size = "md",
  srContext,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  srContext?: string;
  className?: string;
}) {
  const sizeClass = size === "sm" ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-brand font-semibold transition-colors ${sizeClass} ${BUTTON_CLASSES[variant]} ${className}`}
    >
      {children}
      {srContext ? <span className="sr-only"> {srContext}</span> : null}
    </Link>
  );
}

/** Image slot with a calm placeholder when no image has been uploaded yet. */
export function SectionImage({
  src,
  alt,
  priority = false,
  className = "",
  children,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-brand-cream ${className}`}>
      {src ? (
        // `unoptimized` matches the rest of the codebase: Cloudflare Workers
        // has no Next image optimiser, and uploads are already web-sized.
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        // Brand circle motif until staff upload an image.
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          <div className="aspect-square h-3/5 rounded-full bg-white/70" />
        </div>
      )}
      {children}
    </div>
  );
}

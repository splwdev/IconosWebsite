import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-6 ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = "",
  tint = false,
}: {
  children: ReactNode;
  className?: string;
  tint?: boolean;
}) {
  return (
    <section className={`py-20 md:py-24 ${tint ? "bg-brand-cream" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">
      {children}
    </p>
  );
}

export function PrimaryButton({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "dark"
          ? "inline-block rounded-brand bg-brand-dark px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          : "inline-block rounded-brand bg-white px-7 py-3 text-sm font-semibold text-brand-dark transition-opacity hover:opacity-90"
      }
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-block border-b border-brand-dark pb-0.5 text-sm font-semibold text-brand-dark"
    >
      {children}
    </Link>
  );
}

/** The soft blurred-circle motif used throughout the visual identity deck. */
export function CircleAccent({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`rounded-full bg-brand-accent-soft opacity-50 blur-[1px] ${className}`}
    />
  );
}

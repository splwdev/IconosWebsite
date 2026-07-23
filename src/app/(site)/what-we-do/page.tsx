import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { SERVICES } from "@/lib/content/services";

export const metadata: Metadata = {
  title: "What We Do | Iconos Group",
  description:
    "Legal support across corporate, commercial, data protection & GDPR, IP, employment, and M&A.",
};

export default function WhatWeDoPage() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Legal support across the areas that matter to growing businesses."
        intro="We only practise in corporate, commercial, and data protection law — so you always know exactly what you're getting."
      />
      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/5 bg-black/5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <Link
                key={service.slug}
                href={`/what-we-do/${service.slug}`}
                className="bg-white p-8 transition-colors hover:bg-brand-cream"
              >
                <span className="mb-4 block text-xs font-bold text-brand-accent">
                  0{i + 1}
                </span>
                <h2 className="mb-2 font-semibold text-brand-dark">{service.title}</h2>
                <p className="text-sm leading-relaxed text-neutral-500">{service.summary}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { SERVICES, getServiceBySlug } from "@/lib/content/services";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.title} | What We Do | Iconos Group`,
    description: service.summary,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <PageHero eyebrow="What we do" title={service.title} intro={service.summary} />
      <Section>
        <Container className="max-w-2xl">
          <p className="text-[15px] leading-relaxed text-neutral-700">{service.intro}</p>
          <ul className="mt-8 space-y-3">
            {service.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-neutral-700">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-accent" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <PrimaryButton href="/contact">Talk to us about {service.title.toLowerCase()}</PrimaryButton>
          </div>
        </Container>
      </Section>
    </>
  );
}

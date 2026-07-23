import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { WORK_PROGRAMS, getWorkProgramBySlug } from "@/lib/content/how-we-work";

export function generateStaticParams() {
  return WORK_PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = getWorkProgramBySlug(slug);
  if (!program) return {};
  return {
    title: `${program.title} | How We Work | Iconos Group`,
    description: program.summary,
  };
}

export default async function WorkProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getWorkProgramBySlug(slug);
  if (!program) notFound();

  return (
    <>
      <PageHero eyebrow={program.tag} title={program.title} intro={program.summary} />
      <Section>
        <Container className="max-w-2xl">
          <p className="text-[15px] leading-relaxed text-neutral-700">{program.intro}</p>

          <ul className="mt-8 space-y-3">
            {program.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-neutral-700">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-accent" aria-hidden />
                {point}
              </li>
            ))}
          </ul>

          {program.tiers && (
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {program.tiers.map((tier) => (
                <div key={tier.name} className="rounded-2xl bg-brand-cream p-6">
                  <h3 className="mb-2 font-semibold text-brand-dark">{tier.name}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{tier.description}</p>
                </div>
              ))}
              <p className="col-span-full mt-2 text-xs text-neutral-400">
                Tier scope and pricing to be confirmed with Iconos before launch.
              </p>
            </div>
          )}

          <div className="mt-10">
            <PrimaryButton href="/contact">Ask about {program.title.toLowerCase()}</PrimaryButton>
          </div>
        </Container>
      </Section>
    </>
  );
}

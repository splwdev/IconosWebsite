import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { WORK_PROGRAMS } from "@/lib/content/how-we-work";

export const metadata: Metadata = {
  title: "How We Work | Iconos Group",
  description:
    "Managed Legal Services, a tiered Virtual Data Protection Officer service, and ad hoc work — one fixed monthly cost, no surprise invoices.",
};

export default function HowWeWorkPage() {
  return (
    <>
      <PageHero
        eyebrow="How we work"
        title="One fixed monthly cost. No surprise invoices."
        intro="Most firms bill by the hour, which makes clients afraid to ask questions. We run on a subscription model — one predictable monthly budget, no hidden extras."
      />
      <Section>
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {WORK_PROGRAMS.map((program) => (
            <Link
              key={program.slug}
              href={`/how-we-work/${program.slug}`}
              className="rounded-2xl border border-black/10 p-8 transition-colors hover:bg-brand-cream"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-accent">
                {program.tag}
              </p>
              <h2 className="mb-3 text-lg font-semibold text-brand-dark">{program.title}</h2>
              <p className="text-sm leading-relaxed text-neutral-600">{program.summary}</p>
            </Link>
          ))}
        </Container>
      </Section>
    </>
  );
}

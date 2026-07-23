import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Container, Section, Eyebrow, PrimaryButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Who We Are | Iconos Group",
  description:
    "Iconos Group was founded to be an integral part of companies' support teams — led by Erika Moralez Perez.",
};

export default function WhoWeArePage() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="Founded to be part of your team, not outside it."
        intro="Iconos Group was founded in 2021 to be an integral part of companies' support teams — combining legal practice with real commercial experience."
      />

      <Section>
        <Container className="max-w-2xl space-y-5 text-[15px] leading-relaxed text-neutral-700">
          <p>
            By working with sales teams, Iconos Group helps to maximise
            profitability by treating the causes of missed opportunities
            rather than the symptoms, and by providing commercially focused
            legal support to all stakeholders and board executives.
          </p>
          <p>
            We serve growing UK and international businesses — roughly
            10–150 employees, especially in technology, education, health
            and estate agency — who&apos;ve outgrown DIY legal but
            aren&apos;t ready for a full-time hire. Legal advice should add
            to your bottom line, not just sit there as a cost centre.
          </p>
        </Container>
      </Section>

      <Section tint>
        <Container className="grid grid-cols-1 items-center gap-14 md:grid-cols-[0.85fr_1.15fr]">
          <div className="mx-auto aspect-[4/5] w-full max-w-sm rounded-3xl bg-brand-tint" />
          <div>
            <Eyebrow>Our founder</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight text-brand-dark">
              Erika Moralez Perez
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-neutral-700">
              Iconos is led by Erika Moralez Perez, a commercial lawyer who
              combines years of experience in legal practice with a decade
              of business management in international IT and software
              companies.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
              Erika has assembled a team of experienced, fully qualified,
              independent lawyers, as well as like-minded solicitors, to
              deliver a flexible and value-added legal service.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="text-center">
          <h2 className="text-2xl font-semibold text-brand-dark">
            Want to see how we work with businesses like yours?
          </h2>
          <div className="mt-6">
            <PrimaryButton href="/how-we-work">Explore how we work</PrimaryButton>
          </div>
        </Container>
      </Section>
    </>
  );
}

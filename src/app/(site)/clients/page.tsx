import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { TestimonialCard } from "@/components/testimonial-card";
import { TESTIMONIALS } from "@/lib/content/testimonials";

export const metadata: Metadata = {
  title: "Clients | Iconos Group",
  description: "What our clients say about working with Iconos Group.",
};

export default function ClientsPage() {
  return (
    <>
      <PageHero
        eyebrow="Clients"
        title="Businesses that treat legal as a resource, not a cost centre."
        intro="We work with founders, CEOs and COOs across technology, education, health and estate agency businesses in the UK and internationally."
      />
      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.attribution} {...t} />
            ))}
          </div>
          <p className="mt-6 text-xs text-neutral-400">
            Testimonials pending final client sign-off — see Q23 of the
            project questionnaire.
          </p>
        </Container>
      </Section>
      <Section tint>
        <Container className="text-center">
          <h2 className="text-2xl font-semibold text-brand-dark">
            Curious whether Iconos is the right fit for your business?
          </h2>
          <div className="mt-6">
            <PrimaryButton href="/contact">Start a conversation</PrimaryButton>
          </div>
        </Container>
      </Section>
    </>
  );
}

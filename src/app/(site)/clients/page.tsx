import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { TestimonialCard } from "@/components/testimonial-card";
import { getPublishedTestimonials } from "@/lib/content/testimonials";

export const metadata: Metadata = {
  title: "Clients | Iconos Group",
  description: "What our clients say about working with Iconos Group.",
};

export default async function ClientsPage() {
  // Same published testimonials as the homepage, managed in /admin/testimonials.
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      <PageHero
        eyebrow="Clients"
        title="Businesses that treat legal as a resource, not a cost centre."
        intro="We work with founders, CEOs and COOs across technology, education, health and estate agency businesses in the UK and internationally."
      />
      <Section>
        <Container>
          {testimonials.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.id}>
                  <TestimonialCard {...t} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-dark/75">Client stories are coming soon.</p>
          )}
        </Container>
      </Section>
      <Section tint>
        <Container className="text-center">
          <h2 className="text-h2 font-semibold text-brand-dark">
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

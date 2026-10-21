import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PageSectionsRenderer } from "@/components/page-sections-renderer";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { TestimonialFullCard } from "@/components/testimonial-card";
import { getOverviewPage } from "@/lib/content/overview-pages";
import { getPageSections } from "@/lib/content/get-page-sections";
import { getPublishedTestimonials } from "@/lib/content/testimonials";

const FALLBACK_META = {
  title: "Clients | Iconos Group",
  description:
    "Hear from the businesses that rely on Iconos for practical, commercially minded legal support.",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getOverviewPage("clients");
  if (!page) return FALLBACK_META;
  return {
    title: FALLBACK_META.title,
    description: page.meta_description || page.summary || FALLBACK_META.description,
  };
}

export default async function ClientsPage() {
  const page = await getOverviewPage("clients");

  // Editable page (admin → Pages → Clients). Header comes from the page's
  // own eyebrow/heading/intro fields; everything below is sections. The
  // testimonials themselves are managed in admin → Testimonials.
  if (page) {
    const sections = await getPageSections(page.id);
    return (
      <>
        <PageHero eyebrow={page.tag ?? undefined} title={page.title} intro={page.summary} />
        <Container className="pb-8 pt-12 sm:pt-16">
          <PageSectionsRenderer sections={sections} />
        </Container>
      </>
    );
  }

  // Fallback until the page row exists (migration 0029), so the route never
  // renders empty.
  const testimonials = await getPublishedTestimonials();
  return (
    <>
      <PageHero
        eyebrow="Clients"
        title="Trusted by growing businesses."
        intro="Hear from the businesses that rely on Iconos for practical, commercially minded legal support."
      />
      <Section>
        <Container>
          {testimonials.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {testimonials.map((t) => (
                <li key={t.id}>
                  <TestimonialFullCard {...t} />
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
          <h2 className="text-h2 font-semibold text-brand-dark">Looking for a more commercially minded legal partner?</h2>
          <div className="mt-6">
            <PrimaryButton href="/contact">Talk to Iconos</PrimaryButton>
          </div>
        </Container>
      </Section>
    </>
  );
}

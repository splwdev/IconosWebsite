import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PageSectionsRenderer } from "@/components/page-sections-renderer";
import { Container, Section, Eyebrow, PrimaryButton } from "@/components/ui";
import { getOverviewPage } from "@/lib/content/overview-pages";
import { getPageSections } from "@/lib/content/get-page-sections";

const FALLBACK_META = {
  title: "Who We Are | Iconos Group",
  description:
    "We combine legal expertise with real commercial experience, working alongside your business to deliver practical advice that adds value.",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getOverviewPage("who-we-are");
  if (!page) return FALLBACK_META;
  return {
    title: FALLBACK_META.title,
    description: page.meta_description || page.summary || FALLBACK_META.description,
  };
}

export default async function WhoWeArePage() {
  const page = await getOverviewPage("who-we-are");

  // Editable page (admin → Pages → Who We Are). Header comes from the page's
  // own eyebrow/heading/intro fields; everything below is sections.
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

  // Fallback until the page row exists (migration 0028), so the route never
  // renders empty.
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="Part of your team, not just your legal adviser."
        intro="We combine legal expertise with real commercial experience, working alongside your business to deliver practical advice that adds value."
      />

      <Section>
        <Container className="max-w-2xl space-y-5 text-body text-neutral-700">
          <p>
            We work alongside sales teams, business leaders and boards to identify risks, unlock opportunities and
            improve profitability. Our advice is practical, commercially focused and designed to add value, not just
            cost.
          </p>
        </Container>
      </Section>

      <Section tint>
        <Container className="max-w-2xl">
          <Eyebrow>Our founder</Eyebrow>
          <h2 className="text-h2 font-semibold text-brand-dark">Erika Moralez-Perez</h2>
          <p className="mt-5 text-body text-neutral-700">
            Erika combines legal expertise with first-hand commercial experience, having spent nearly a decade in IT
            and software businesses before qualifying as a solicitor.
          </p>
        </Container>
      </Section>

      <Section>
        <Container className="text-center">
          <h2 className="text-h2 font-semibold text-brand-dark">Want to see how we work with businesses like yours?</h2>
          <div className="mt-6">
            <PrimaryButton href="/how-we-work">See how we work</PrimaryButton>
          </div>
        </Container>
      </Section>
    </>
  );
}

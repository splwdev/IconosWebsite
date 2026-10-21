import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PageSectionsRenderer } from "@/components/page-sections-renderer";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { getOverviewPage } from "@/lib/content/overview-pages";
import { getPageSections } from "@/lib/content/get-page-sections";

const FALLBACK_META = {
  title: "Work With Us | Iconos Group",
  description:
    "Consultant lawyers, data protection professionals and referral partners: join a commercially minded legal team.",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getOverviewPage("work-with-us");
  if (!page) return FALLBACK_META;
  return {
    title: FALLBACK_META.title,
    description: page.meta_description || page.summary || FALLBACK_META.description,
  };
}

export default async function WorkWithUsPage() {
  const page = await getOverviewPage("work-with-us");

  // Editable page (admin → Pages → Work With Us). Header comes from the
  // page's own eyebrow/heading/intro fields; everything below is sections.
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

  // Fallback until the page row exists (migration 0031).
  return (
    <>
      <PageHero
        eyebrow="Work with us"
        title="Join a commercially minded legal team."
        intro="We work with experienced consultant lawyers, data protection professionals and like-minded people who believe legal advice should help businesses grow, not slow them down."
      />
      <Section tint>
        <Container className="text-center">
          <PrimaryButton href="/work-with-us/get-in-touch">Start a conversation</PrimaryButton>
        </Container>
      </Section>
    </>
  );
}

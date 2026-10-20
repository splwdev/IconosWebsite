import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getPageSections } from "@/lib/content/get-page-sections";
import { hasOwnCallToAction } from "@/lib/content/page-sections";
import { PageSectionsRenderer } from "@/components/page-sections-renderer";
import type { Page } from "@/lib/content/pages";
 
async function getProgramPage(slug: string): Promise<Page | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("parent_section", "how-we-work")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as Page | null;
}
 
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramPage(slug);
  if (!program) return {};
  return {
    title: `${program.title} | How We Work | Iconos Group`,
    description: program.meta_description || program.summary,
  };
}
 
export default async function WorkProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgramPage(slug);
  if (!program) notFound();
 
  const sections = await getPageSections(program.id);
 
  return (
    <>
      <PageHero eyebrow={program.tag ?? "How we work"} title={program.heading || program.title} intro={program.intro || program.summary} />
      <Section>
        <Container>
          {program.featured_image_url && (
            <div className="relative mb-12 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl">
              <Image
                src={program.featured_image_url}
                alt={program.featured_image_alt ?? ""}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          {/* Pricing tiers now render as an ordinary section within
              sections (see PageSectionsRenderer) rather than a separate
              hardcoded block — a program can have zero, one, or several
              tiers sections, positioned wherever the admin placed them. */}
          <PageSectionsRenderer sections={sections} />
          {!hasOwnCallToAction(sections) && (
            <div className="mt-10">
              <PrimaryButton href="/contact">Ask about {program.title.toLowerCase()}</PrimaryButton>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
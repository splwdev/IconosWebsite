import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { LEGAL_PAGES, getLegalPageBySlug } from "@/lib/content/legal-pages";

export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPageBySlug(slug);
  if (!page) return {};
  return { title: `${page.title} | Iconos Group` };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLegalPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero title={page.title} />
      <Section>
        <Container className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-neutral-700">
          {page.pendingClientReview && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This page contains placeholder text. Final wording is pending
              Iconos Group&apos;s own review before launch (see the
              completed website questionnaire, Q34).
            </div>
          )}
          {page.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </Container>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
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
 
  return (
    <>
      <PageHero eyebrow={program.tag ?? "How we work"} title={program.title} intro={program.summary} />
      <Section>
        <Container className="max-w-2xl">
          {program.featured_image_url && (
            <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={program.featured_image_url}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          {/* program.body is Tiptap HTML, sanitized server-side at save
              time — safe to render directly. */}
          <div
            className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700"
            dangerouslySetInnerHTML={{ __html: program.body }}
          />
 
          {program.tiers && program.tiers.length > 0 && (
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {program.tiers.map((tier) => (
                <div key={tier.name} className="rounded-2xl bg-brand-cream p-6">
                  <h3 className="mb-2 font-semibold text-brand-dark">{tier.name}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{tier.description}</p>
                </div>
              ))}
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
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { Container, Section, PrimaryButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/content/pages";
 
async function getServicePage(slug: string): Promise<Page | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("parent_section", "what-we-do")
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
  const service = await getServicePage(slug);
  if (!service) return {};
  return {
    title: `${service.title} | What We Do | Iconos Group`,
    description: service.meta_description || service.summary,
  };
}
 
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServicePage(slug);
  if (!service) notFound();
 
  return (
    <>
      <PageHero eyebrow="What we do" title={service.title} intro={service.summary} />
      <Section>
        <Container className="max-w-2xl">
          {service.featured_image_url && (
            <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={service.featured_image_url}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          {/* service.body is Tiptap HTML, sanitized server-side with
              DOMPurify at save time (see sanitizePostBody in
              admin/pages/actions.ts) — safe to render directly. */}
          <div
            className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700"
            dangerouslySetInnerHTML={{ __html: service.body }}
          />
          <div className="mt-10">
            <PrimaryButton href="/contact">
              Talk to us about {service.title.toLowerCase()}
            </PrimaryButton>
          </div>
        </Container>
      </Section>
    </>
  );
}
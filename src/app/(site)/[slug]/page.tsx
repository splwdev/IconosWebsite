import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/content/pages";
 
async function getCustomPage(slug: string): Promise<Page | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("page_type", "custom")
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
  const page = await getCustomPage(slug);
  if (!page) return {};
  return {
    title: `${page.title} | Iconos Group`,
    description: page.meta_description || page.summary,
  };
}
 
export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getCustomPage(slug);
  if (!page) notFound();
 
  return (
    <>
      <PageHero eyebrow="Iconos Group" title={page.title} intro={page.summary} />
      <Section>
        <Container className="max-w-2xl">
          {page.featured_image_url && (
            <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={page.featured_image_url}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          {/* page.body is Tiptap HTML, sanitized server-side at save time
              (see sanitizePostBody in admin/pages/actions.ts) — safe to
              render directly. */}
          <div
            className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        </Container>
      </Section>
    </>
  );
}
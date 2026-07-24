import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { getPublishedPostBySlug } from "@/lib/blog/posts";

// No generateStaticParams: posts are published dynamically by staff at any
// time, so this route resolves per-request (with a short revalidate window)
// rather than being fixed at build time.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Iconos Group Blog`,
    description: post.meta_description || post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <PageHero eyebrow={post.category} title={post.title} />
      <Section>
        <Container className="max-w-2xl">
          <p className="mb-8 text-xs uppercase tracking-wide text-neutral-400">
            {post.published_at &&
              new Date(post.published_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
          </p>

          {post.featured_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featured_image_url}
              alt=""
              className="mb-8 aspect-video w-full rounded-2xl object-cover"
            />
          )}

          {/*
            post.body is HTML from the rich text editor, sanitized with
            DOMPurify at save time (see sanitizePostBody in
            src/lib/blog/sanitize.ts) — that's the actual security boundary,
            not this render step. Only reached via getPublishedPostBySlug,
            which RLS restricts to genuinely published posts.
          */}
          <div
            className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </Container>
      </Section>
    </>
  );
}
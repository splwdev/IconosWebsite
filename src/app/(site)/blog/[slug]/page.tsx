import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
            remarkGfm adds table/strikethrough/task-list support. Raw HTML
            in the Markdown source is NOT rendered (react-markdown's default
            behaviour) — defense in depth even though only staff can author
            this content.
          */}
          <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        </Container>
      </Section>
    </>
  );
}

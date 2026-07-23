import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/content/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} | Iconos Group Blog`, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <PageHero eyebrow={post.category} title={post.title} />
      <Section>
        <Container className="max-w-2xl space-y-5 text-[15px] leading-relaxed text-neutral-700">
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {post.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </Container>
      </Section>
    </>
  );
}

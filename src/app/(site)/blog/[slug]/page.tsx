import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { getPublishedPostBySlug } from "@/lib/blog/posts";
import { canViewBlog } from "@/lib/settings/blog-access";
 
// No generateStaticParams, and deliberately no ISR revalidate window either
// — this always renders fresh per request, consistent with every other
// Supabase-driven route in the app. ISR relies on OpenNext's incremental
// cache, which has no KV/R2/Durable Object backend configured on this
// Cloudflare deployment (the same class of caching gap that caused the
// Staff page bug), so opting into it here was unreliable rather than
// actually faster.
 
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
  // Hidden while the Blog is switched off (admin → Settings); staff can preview.
  if (!(await canViewBlog())) notFound();
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
 
          {/* A featured video takes priority over a featured image — a
              video-led post (vlog, talk) generally has no separate need
              for a static hero image too. */}
          {post.featured_video_url ? (
            <div className="mb-8">
              <YouTubeEmbed url={post.featured_video_url} title={post.title} />
            </div>
          ) : (
            post.featured_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt ?? ""}
                className="mb-8 aspect-video w-full rounded-2xl object-cover"
              />
            )
          )}
 
          {/*
            post.body is HTML from the rich text editor, sanitized with
            DOMPurify at save time (see sanitizePostBody in
            src/lib/blog/sanitize.ts) — that's the actual security boundary,
            not this render step. Only reached via getPublishedPostBySlug,
            which RLS restricts to genuinely published posts.
          */}
          <div
            className="prose prose-neutral max-w-none text-body text-neutral-700 prose-h2:text-h2 prose-h3:text-h3 prose-h4:text-h4"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </Container>
      </Section>
    </>
  );
}
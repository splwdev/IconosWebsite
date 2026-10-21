import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/blog/posts";
import { canViewBlog } from "@/lib/settings/blog-access";

export const metadata: Metadata = {
  title: "Blog | Iconos Group",
  description: "Weekly, practical, commercially minded legal insight from Iconos Group.",
};

// Rendered per request: posts are published at any time, and while the
// Blog is switched off only signed-in staff may see it, so a cached copy
// must never be served.
export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  // Hidden while the Blog is switched off (admin → Settings); staff can preview.
  if (!(await canViewBlog())) notFound();
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Weekly, practical, commercially minded."
        intro="Insight on corporate, commercial and data protection law, written for founders and operators, not other lawyers."
      />
      <Section>
        <Container>
          {posts.length === 0 ? (
            <p className="text-sm text-neutral-500">
              New posts are on the way — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-2xl border border-black/5 transition-shadow hover:shadow-md"
                >
                  <div
                    className="h-36 bg-brand-tint bg-cover bg-center"
                    style={
                      post.featured_image_url
                        ? { backgroundImage: `url(${post.featured_image_url})` }
                        : undefined
                    }
                  />
                  <div className="p-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-accent">
                      {post.category}
                    </p>
                    <h2 className="mb-2 text-h3 font-semibold text-brand-dark">
                      {post.title}
                    </h2>
                    <p className="text-sm text-neutral-500">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

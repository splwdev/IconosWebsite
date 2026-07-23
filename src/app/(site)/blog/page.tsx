import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { getPublishedPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog | Iconos Group",
  description: "Weekly, practical, commercially minded legal insight from Iconos Group.",
};

// Revalidate frequently rather than statically generate, since posts are
// staff-published at any time; publishPost() also explicitly revalidates
// this path so changes are visible immediately, not just after 60s.
export const revalidate = 60;

export default async function BlogIndexPage() {
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
                    <h2 className="mb-2 font-semibold leading-snug text-brand-dark">
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

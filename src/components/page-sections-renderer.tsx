import Image from "next/image";
import Link from "next/link";
import type { PageSection, MediaSize } from "@/lib/content/page-sections";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { TestimonialCard } from "@/components/testimonial-card";
import { TESTIMONIALS } from "@/lib/content/testimonials";
import { getPublishedPosts } from "@/lib/blog/posts";
import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/content/pages";
 
const MEDIA_SIZE_CLASS: Record<MediaSize, string> = {
  small: "w-1/3",
  medium: "w-2/3",
  large: "w-full",
};
 
// PageSectionsRenderer is an async Server Component — the four "smart"
// section types (services_grid, programs_highlight, testimonials,
// blog_teaser) fetch their own live data here. Existing callers
// (<PageSectionsRenderer sections={sections} />) don't need any change —
// React Server Components support async function components used directly
// as JSX, the same as a sync one.
export async function PageSectionsRenderer({ sections }: { sections: PageSection[] }) {
  return (
    <div>
      {sections.map((section, i) => (
        <div
          key={i}
          className={
            section.background === "tint"
              ? "mb-10 rounded-2xl bg-brand-cream p-6 last:mb-0 sm:p-10"
              : "mb-10 last:mb-0"
          }
        >
          <PageSectionBlock section={section} />
        </div>
      ))}
    </div>
  );
}
 
function Eyebrow({ children }: { children: string }) {
  if (!children) return null;
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-accent">
      {children}
    </p>
  );
}
 
async function PageSectionBlock({ section }: { section: PageSection }) {
  switch (section.section_type) {
    case "text":
      // Tiptap HTML, sanitized server-side at save time (see saveSections
      // in admin/(protected)/pages/actions.ts) — safe to render directly.
      return (
        <div>
          <Eyebrow>{section.content.eyebrow}</Eyebrow>
          <div
            className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700"
            dangerouslySetInnerHTML={{ __html: section.content.body }}
          />
        </div>
      );
 
    case "media": {
      const { media_type, image_url, video_url, size, caption } = section.content;
      return (
        <div>
          <div className={`mx-auto ${MEDIA_SIZE_CLASS[size]}`}>
            {media_type === "video" ? (
              <YouTubeEmbed url={video_url} title={caption || undefined} />
            ) : image_url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <Image src={image_url} alt="" fill unoptimized className="object-cover" />
              </div>
            ) : null}
          </div>
          {caption && <p className="mt-3 text-center text-sm text-neutral-500">{caption}</p>}
        </div>
      );
    }
 
    case "media_text": {
      const { eyebrow, media_type, image_url, video_url, body, layout } = section.content;
      const mediaFirst = layout !== "media-right";
      return (
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className={mediaFirst ? "md:order-1" : "md:order-2"}>
            {media_type === "video" ? (
              video_url ? (
                <YouTubeEmbed url={video_url} />
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-brand-cream" />
              )
            ) : image_url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <Image src={image_url} alt="" fill unoptimized className="object-cover" />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-brand-cream" />
            )}
          </div>
          <div className={mediaFirst ? "md:order-2" : "md:order-1"}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <div
              className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>
      );
    }
 
    case "cta": {
      const {
        eyebrow,
        heading,
        body,
        style,
        button_label,
        button_href,
        secondary_button_label,
        secondary_button_href,
      } = section.content;
      const isDark = style === "dark";
      return (
        <div
          className={
            isDark
              ? "rounded-3xl bg-brand-dark px-8 py-14 text-center text-white md:px-16"
              : "rounded-3xl bg-brand-cream px-8 py-14 text-center md:px-16"
          }
        >
          {eyebrow && (
            <p
              className={`mb-3 text-xs font-bold uppercase tracking-widest ${
                isDark ? "text-white/70" : "text-brand-accent"
              }`}
            >
              {eyebrow}
            </p>
          )}
          <h2 className={`text-2xl font-semibold md:text-3xl ${isDark ? "" : "text-brand-dark"}`}>
            {heading}
          </h2>
          {body && (
            <p
              className={`mx-auto mt-4 max-w-md text-[15px] leading-relaxed ${
                isDark ? "text-white/75" : "text-neutral-600"
              }`}
            >
              {body}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <Link
              href={button_href}
              className={
                isDark
                  ? "inline-block rounded-brand bg-white px-6 py-2.5 text-sm font-semibold text-brand-dark hover:opacity-90"
                  : "inline-block rounded-brand bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              }
            >
              {button_label}
            </Link>
            {secondary_button_label && secondary_button_href && (
              <Link
                href={secondary_button_href}
                className={
                  isDark
                    ? "border-b border-white/60 pb-0.5 text-sm font-semibold text-white"
                    : "border-b border-brand-dark pb-0.5 text-sm font-semibold text-brand-dark"
                }
              >
                {secondary_button_label}
              </Link>
            )}
          </div>
        </div>
      );
    }
 
    case "tiers": {
      const { tiers } = section.content;
      if (tiers.length === 0) return null;
      return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className="rounded-2xl bg-brand-cream p-6">
              <h3 className="mb-2 font-semibold text-brand-dark">{tier.name}</h3>
              <p className="text-sm leading-relaxed text-neutral-600">{tier.description}</p>
            </div>
          ))}
        </div>
      );
    }
 
    case "services_grid": {
      const { eyebrow, heading, intro } = section.content;
      const supabase = await createClient();
      const { data } = await supabase
        .from("pages")
        .select("*")
        .eq("parent_section", "what-we-do")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      const services = (data as Page[] | null) ?? [];
 
      return (
        <div>
          <div className="mb-12 max-w-xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            {heading && (
              <h2 className="text-3xl font-semibold leading-tight text-brand-dark">{heading}</h2>
            )}
            {intro && (
              <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">{intro}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/5 bg-black/5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Link
                key={service.slug}
                href={`/what-we-do/${service.slug}`}
                className="bg-white p-8 transition-colors hover:bg-brand-cream"
              >
                <span className="mb-4 block text-xs font-bold text-brand-accent">
                  0{i + 1}
                </span>
                <h3 className="mb-2 font-semibold text-brand-dark">{service.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{service.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      );
    }
 
    case "programs_highlight": {
      const { eyebrow, heading } = section.content;
      const supabase = await createClient();
      const { data } = await supabase
        .from("pages")
        .select("*")
        .eq("parent_section", "how-we-work")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      const programs = (data as Page[] | null) ?? [];
      if (programs.length === 0) return null;
 
      return (
        <div>
          <div className="mb-12 max-w-xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            {heading && (
              <h2 className="text-3xl font-semibold leading-tight text-brand-dark">{heading}</h2>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {programs.map((program) => (
              <div key={program.slug} className="rounded-2xl border border-black/10 p-8">
                {program.tag && (
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-accent">
                    {program.tag}
                  </p>
                )}
                <h3 className="mb-3 text-xl font-semibold text-brand-dark">{program.title}</h3>
                <p className="mb-6 text-[15px] leading-relaxed text-neutral-600">
                  {program.summary}
                </p>
                <Link
                  href={`/how-we-work/${program.slug}`}
                  className="border-b border-brand-dark pb-0.5 text-sm font-semibold text-brand-dark"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      );
    }
 
    case "testimonials": {
      const { eyebrow, heading } = section.content;
      return (
        <div>
          <div className="mb-10 max-w-xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            {heading && (
              <h2 className="text-3xl font-semibold leading-tight text-brand-dark">{heading}</h2>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.attribution} {...t} />
            ))}
          </div>
        </div>
      );
    }
 
    case "blog_teaser": {
      const { eyebrow, heading } = section.content;
      const recentPosts = await getPublishedPosts(3);
 
      return (
        <div>
          <div className="mb-10 max-w-xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            {heading && (
              <h2 className="text-3xl font-semibold leading-tight text-brand-dark">{heading}</h2>
            )}
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-neutral-500">New posts are on the way.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white"
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
                    <h3 className="mb-2 font-semibold leading-snug text-brand-dark">
                      {post.title}
                    </h3>
                    <p className="text-sm text-neutral-500">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
 
    default:
      return null;
  }
}
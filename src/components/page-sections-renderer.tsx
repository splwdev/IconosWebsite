import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PageSection, MediaSize } from "@/lib/content/page-sections";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { TestimonialCard } from "@/components/testimonial-card";
import { getPublishedTestimonials } from "@/lib/content/testimonials";
import { getPublishedPosts } from "@/lib/blog/posts";
import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/content/pages";
import { HeroSection } from "@/components/sections/hero-section";
import { IssuesSection } from "@/components/sections/issues-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { StepsSection } from "@/components/sections/steps-section";
import { TextChecklistSection } from "@/components/sections/text-checklist-section";
import { ComparisonSection } from "@/components/sections/comparison-section";
import { TestimonialSpotlightSection } from "@/components/sections/testimonial-spotlight-section";
import {
  ButtonLink,
  SectionEyebrow,
  SectionImage,
  SectionTitle,
  mutedText,
} from "@/components/sections/section-primitives";

const MEDIA_SIZE_CLASS: Record<MediaSize, string> = {
  small: "w-1/3",
  medium: "w-2/3",
  large: "w-full",
};

// Shared prose styling for staff-authored rich text (Tiptap HTML). A
// blockquote is styled as a large pull quote, which is how the founder
// section's quote is authored.
const PROSE_CLASS =
  "prose prose-neutral max-w-none text-body text-brand-dark/80 " +
  "prose-h2:text-h2 prose-h3:text-h3 prose-h4:text-h4 " +
  "prose-headings:text-brand-dark prose-a:text-brand-dark prose-strong:text-brand-dark " +
  "prose-blockquote:mb-5 prose-blockquote:mt-0 prose-blockquote:border-0 prose-blockquote:p-0 prose-blockquote:not-italic " +
  // Pull quote: scales with the theme's Heading 2 size.
  "prose-blockquote:text-[length:calc(var(--text-h2)*0.78)] prose-blockquote:font-medium prose-blockquote:leading-snug " +
  "prose-blockquote:text-brand-dark";

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
        <section
          key={i}
          className={
            section.background === "tint"
              ? "mb-16 rounded-3xl bg-brand-cream px-5 py-8 last:mb-0 sm:px-10 sm:py-12 md:mb-20"
              : "mb-16 last:mb-0 md:mb-20"
          }
        >
          <PageSectionBlock section={section} />
        </section>
      ))}
    </div>
  );
}

async function PageSectionBlock({ section }: { section: PageSection }) {
  switch (section.section_type) {
    case "hero":
      return <HeroSection content={section.content} />;

    case "issues":
      return <IssuesSection content={section.content} />;

    case "features":
      return <FeaturesSection content={section.content} />;

    case "steps":
      return <StepsSection content={section.content} onTint={section.background === "tint"} />;

    case "text_checklist":
      return <TextChecklistSection content={section.content} />;

    case "comparison":
      return <ComparisonSection content={section.content} />;

    case "testimonial_spotlight":
      return <TestimonialSpotlightSection content={section.content} onTint={section.background === "tint"} />;

    case "text":
      // Tiptap HTML, sanitized server-side at save time (see saveSections
      // in admin/(protected)/pages/actions.ts) — safe to render directly.
      return (
        // Capped at a readable line length now that pages use the full width.
        <div className="max-w-3xl">
          <SectionEyebrow>{section.content.eyebrow}</SectionEyebrow>
          <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: section.content.body }} />
        </div>
      );

    case "media": {
      const { media_type, image_url, image_alt, size, caption, video_url } = section.content;
      return (
        <div>
          <div className={`mx-auto ${MEDIA_SIZE_CLASS[size]}`}>
            {media_type === "video" ? (
              <YouTubeEmbed url={video_url} title={caption || undefined} />
            ) : image_url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <Image src={image_url} alt={image_alt} fill unoptimized className="object-cover" />
              </div>
            ) : null}
          </div>
          {caption && <p className={`mt-3 text-center text-small ${mutedText}`}>{caption}</p>}
        </div>
      );
    }

    case "media_text": {
      const { eyebrow, media_type, image_url, image_alt, video_url, body, layout, button_label, button_href } =
        section.content;
      const mediaFirst = layout !== "media-right";
      return (
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className={mediaFirst ? "md:order-1" : "md:order-2"}>
            {media_type === "video" && video_url ? (
              <YouTubeEmbed url={video_url} />
            ) : (
              <SectionImage
                src={media_type === "image" ? image_url : null}
                alt={image_alt}
                className="aspect-[5/4]"
              />
            )}
          </div>
          <div className={mediaFirst ? "md:order-2" : "md:order-1"}>
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: body }} />
            {button_label && button_href && (
              <ButtonLink href={button_href} variant="outline" size="sm" className="mt-6">
                {button_label}
              </ButtonLink>
            )}
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
          className={`mx-auto max-w-2xl rounded-3xl px-6 py-10 text-center sm:px-12 ${
            isDark ? "bg-brand-dark text-white" : "bg-brand-cream"
          }`}
        >
          <SectionEyebrow tone={isDark ? "light" : "dark"}>{eyebrow}</SectionEyebrow>
          <h2
            // Slightly smaller than a section title so it fits the narrower panel.
            className={`text-balance text-[length:calc(var(--text-h2)*0.85)] font-semibold leading-tight tracking-tight ${
              isDark ? "" : "text-brand-dark"
            }`}
          >
            {heading}
          </h2>
          {body && (
            <p
              className={`mx-auto mt-3 max-w-md text-body ${
                isDark ? "text-white/75" : mutedText
              }`}
            >
              {body}
            </p>
          )}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
            <ButtonLink href={button_href} variant={isDark ? "inverse" : "solid"}>
              {button_label}
            </ButtonLink>
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
              <h3 className="mb-2 text-h3 font-semibold text-brand-dark">{tier.name}</h3>
              <p className={`text-small ${mutedText}`}>{tier.description}</p>
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
          <div className="max-w-3xl">
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <SectionTitle>{heading}</SectionTitle>
            {intro && <p className={`mt-4 text-body ${mutedText}`}>{intro}</p>}
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/what-we-do/${service.slug}`}
                  className={`group block h-full rounded-2xl p-6 transition-shadow hover:shadow-md ${
                    section.background === "tint" ? "bg-white" : "bg-brand-cream"
                  }`}
                >
                  <h3 className="text-h3 font-medium text-brand-dark group-hover:underline group-hover:underline-offset-4">
                    {service.title}
                  </h3>
                  <p className={`mt-2 text-small ${mutedText}`}>{service.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
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
          <div className="mb-10 max-w-3xl">
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <SectionTitle>{heading}</SectionTitle>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {programs.map((program) => (
              <div key={program.slug} className="flex flex-col rounded-2xl bg-white p-7 ring-1 ring-brand-dark/10">
                {program.tag && (
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.18em] ${mutedText}`}>
                    {program.tag}
                  </p>
                )}
                <h3 className="mb-2 text-h3 font-medium text-brand-dark">{program.title}</h3>
                <p className={`mb-6 text-body ${mutedText}`}>{program.summary}</p>
                <div className="mt-auto">
                  <ButtonLink href={`/how-we-work/${program.slug}`} srContext={`about ${program.title}`}>
                    Learn more
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "testimonials": {
      const { eyebrow, heading, button_label, button_href } = section.content;
      const testimonials = await getPublishedTestimonials();
      if (testimonials.length === 0) return null;

      return (
        <div>
          <div className="max-w-3xl">
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <SectionTitle>{heading}</SectionTitle>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.id}>
                <TestimonialCard {...t} onTint={section.background === "tint"} />
              </li>
            ))}
          </ul>
          {button_label && button_href && (
            <ButtonLink href={button_href} variant="outline" size="sm" className="mt-6">
              {button_label}
            </ButtonLink>
          )}
        </div>
      );
    }

    case "blog_teaser": {
      const { eyebrow, heading } = section.content;
      const recentPosts = await getPublishedPosts(3);
      const cardBg = section.background === "tint" ? "bg-white" : "bg-brand-cream";

      return (
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <SectionEyebrow>{eyebrow}</SectionEyebrow>
              <SectionTitle>{heading}</SectionTitle>
            </div>
            {recentPosts.length > 0 && (
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark underline underline-offset-4"
              >
                View all articles
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            )}
          </div>
          {recentPosts.length === 0 ? (
            <p
              className={`mt-8 rounded-2xl border border-dashed border-brand-dark/20 p-6 text-sm ${cardBg} ${mutedText}`}
            >
              New posts are on the way.
            </p>
          ) : (
            <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={`group flex h-full flex-col overflow-hidden rounded-2xl transition-shadow hover:shadow-md ${cardBg}`}
                  >
                    {post.featured_image_url && (
                      <div
                        aria-hidden
                        className="h-36 bg-brand-tint bg-cover bg-center"
                        style={{ backgroundImage: `url(${post.featured_image_url})` }}
                      />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {post.category && (
                        <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.18em] ${mutedText}`}>
                          {post.category}
                        </p>
                      )}
                      <h3 className="mb-2 text-h3 font-medium text-brand-dark group-hover:underline group-hover:underline-offset-4">
                        {post.title}
                      </h3>
                      <p className={`line-clamp-3 text-small ${mutedText}`}>{post.excerpt}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

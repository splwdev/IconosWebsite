import Image from "next/image";
import Link from "next/link";
import type { PageSection, MediaSize } from "@/lib/content/page-sections";
import { YouTubeEmbed } from "@/components/youtube-embed";
 
const MEDIA_SIZE_CLASS: Record<MediaSize, string> = {
  small: "w-1/3",
  medium: "w-2/3",
  large: "w-full",
};
 
export function PageSectionsRenderer({ sections }: { sections: PageSection[] }) {
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
 
function PageSectionBlock({ section }: { section: PageSection }) {
  switch (section.section_type) {
    case "text":
      // Tiptap HTML, sanitized server-side at save time (see saveSections
      // in admin/(protected)/pages/actions.ts) — safe to render directly.
      return (
        <div
          className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700"
          dangerouslySetInnerHTML={{ __html: section.content.body }}
        />
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
      const { media_type, image_url, video_url, body, layout } = section.content;
      const mediaFirst = layout !== "media-right";
      return (
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className={mediaFirst ? "md:order-1" : "md:order-2"}>
            {media_type === "video" ? (
              <YouTubeEmbed url={video_url} />
            ) : image_url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <Image src={image_url} alt="" fill unoptimized className="object-cover" />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-brand-cream" />
            )}
          </div>
          <div
            className={`prose prose-neutral max-w-none text-[15px] leading-relaxed text-neutral-700 ${
              mediaFirst ? "md:order-2" : "md:order-1"
            }`}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </div>
      );
    }
 
    case "cta": {
      const { heading, body, button_label, button_href } = section.content;
      return (
        <div className="rounded-3xl bg-brand-dark px-8 py-14 text-center text-white md:px-16">
          <h2 className="text-2xl font-semibold md:text-3xl">{heading}</h2>
          {body && (
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
              {body}
            </p>
          )}
          <div className="mt-8">
            <Link
              href={button_href}
              className="inline-block rounded-brand bg-white px-6 py-2.5 text-sm font-semibold text-brand-dark hover:opacity-90"
            >
              {button_label}
            </Link>
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
 
    default:
      return null;
  }
}
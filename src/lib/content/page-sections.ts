import { z } from "zod";
import { tierSchema } from "./pages";
import { isValidYouTubeUrl } from "./youtube";
 
export const SECTION_TYPES = [
  "text",
  "media",
  "media_text",
  "cta",
  "tiers",
  "services_grid",
  "programs_highlight",
  "testimonials",
  "blog_teaser",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];
 
export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  text: "Text",
  media: "Media",
  media_text: "Media + Text",
  cta: "Call to Action",
  tiers: "Pricing Tiers",
  services_grid: "Services Grid",
  programs_highlight: "Programs Highlight",
  testimonials: "Testimonials",
  blog_teaser: "Blog Teaser",
};
 
// These four render live data (published services/programs, testimonials,
// recent posts) and only make sense on the singleton homepage — the admin
// editor filters the "+ Add section" list to these based on page_type,
// though nothing at the schema/DB level actually forbids them elsewhere.
export const HOME_ONLY_SECTION_TYPES: readonly SectionType[] = [
  "services_grid",
  "programs_highlight",
  "testimonials",
  "blog_teaser",
];
 
export const MEDIA_TYPES = ["image", "video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
 
export const MEDIA_SIZES = ["small", "medium", "large"] as const;
export type MediaSize = (typeof MEDIA_SIZES)[number];
 
export const MEDIA_LAYOUTS = ["media-left", "media-right"] as const;
export type MediaLayout = (typeof MEDIA_LAYOUTS)[number];
 
export const SECTION_BACKGROUNDS = ["none", "tint"] as const;
export type SectionBackground = (typeof SECTION_BACKGROUNDS)[number];
 
export const CTA_STYLES = ["light", "dark"] as const;
export type CtaStyle = (typeof CTA_STYLES)[number];
 
// eyebrow defaults to "" so existing rows saved before this field existed
// (nothing in the live DB predates it except a handful of text sections)
// parse cleanly without a data migration — a missing key is treated the
// same as an explicitly empty one.
export const textSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  body: z.string(),
});
export type TextSectionContent = z.infer<typeof textSectionContentSchema>;
 
/**
 * Shared cross-field check used by both media section types: a video needs
 * a genuinely parseable YouTube URL, an image needs an uploaded image_url.
 * Kept as a plain function (not a shared base schema) since ZodEffects
 * objects don't compose cleanly via .extend()/.shape — duplicating the
 * check inline in each schema's superRefine is simpler than fighting that.
 */
function checkMediaFields(
  data: { media_type: MediaType; image_url: string | null; video_url: string },
  ctx: z.RefinementCtx
) {
  if (data.media_type === "video" && data.video_url && !isValidYouTubeUrl(data.video_url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["video_url"],
      message: "Enter a valid YouTube URL",
    });
  }
}
 
export const mediaSectionContentSchema = z
  .object({
    media_type: z.enum(MEDIA_TYPES),
    image_url: z.string().nullable(),
    video_url: z.string(),
    size: z.enum(MEDIA_SIZES),
    caption: z.string(),
  })
  .superRefine(checkMediaFields);
export type MediaSectionContent = z.infer<typeof mediaSectionContentSchema>;
 
export const mediaTextSectionContentSchema = z
  .object({
    eyebrow: z.string().default(""),
    media_type: z.enum(MEDIA_TYPES),
    image_url: z.string().nullable(),
    video_url: z.string(),
    body: z.string(),
    layout: z.enum(MEDIA_LAYOUTS),
  })
  .superRefine(checkMediaFields);
export type MediaTextSectionContent = z.infer<typeof mediaTextSectionContentSchema>;
 
// heading/body/button labels are plain strings rendered as text, not HTML
// — no rich-text editor and no sanitization needed, React escapes them by
// default.
export const ctaSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().min(1, "Required"),
  body: z.string(),
  style: z.enum(CTA_STYLES).default("dark"),
  button_label: z.string().min(1, "Required"),
  button_href: z.string().min(1, "Required"),
  secondary_button_label: z.string().default(""),
  secondary_button_href: z.string().default(""),
});
export type CtaSectionContent = z.infer<typeof ctaSectionContentSchema>;
 
export const tiersSectionContentSchema = z.object({
  tiers: z.array(tierSchema),
});
export type TiersSectionContent = z.infer<typeof tiersSectionContentSchema>;
 
export const servicesGridSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  intro: z.string().default(""),
});
export type ServicesGridSectionContent = z.infer<typeof servicesGridSectionContentSchema>;
 
export const programsHighlightSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
});
export type ProgramsHighlightSectionContent = z.infer<typeof programsHighlightSectionContentSchema>;
 
export const testimonialsSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
});
export type TestimonialsSectionContent = z.infer<typeof testimonialsSectionContentSchema>;
 
export const blogTeaserSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
});
export type BlogTeaserSectionContent = z.infer<typeof blogTeaserSectionContentSchema>;
 
export const pageSectionSchema = z.discriminatedUnion("section_type", [
  z.object({
    section_type: z.literal("text"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: textSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("media"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: mediaSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("media_text"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: mediaTextSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("cta"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: ctaSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("tiers"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: tiersSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("services_grid"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: servicesGridSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("programs_highlight"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: programsHighlightSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("testimonials"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: testimonialsSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("blog_teaser"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: blogTeaserSectionContentSchema,
  }),
]);
 
export type PageSection = z.infer<typeof pageSectionSchema>;
 
export function createBlankSection(type: SectionType): PageSection {
  switch (type) {
    case "text":
      return { section_type: "text", background: "none", content: { eyebrow: "", body: "" } };
    case "media":
      return {
        section_type: "media",
        background: "none",
        content: {
          media_type: "image",
          image_url: null,
          video_url: "",
          size: "medium",
          caption: "",
        },
      };
    case "media_text":
      return {
        section_type: "media_text",
        background: "none",
        content: {
          eyebrow: "",
          media_type: "image",
          image_url: null,
          video_url: "",
          body: "",
          layout: "media-left",
        },
      };
    case "cta":
      return {
        section_type: "cta",
        background: "none",
        content: {
          eyebrow: "",
          heading: "",
          body: "",
          style: "dark",
          button_label: "Get in touch",
          button_href: "/contact",
          secondary_button_label: "",
          secondary_button_href: "",
        },
      };
    case "tiers":
      return { section_type: "tiers", background: "none", content: { tiers: [] } };
    case "services_grid":
      return {
        section_type: "services_grid",
        background: "none",
        content: { eyebrow: "", heading: "", intro: "" },
      };
    case "programs_highlight":
      return {
        section_type: "programs_highlight",
        background: "none",
        content: { eyebrow: "", heading: "" },
      };
    case "testimonials":
      return {
        section_type: "testimonials",
        background: "none",
        content: { eyebrow: "", heading: "" },
      };
    case "blog_teaser":
      return {
        section_type: "blog_teaser",
        background: "none",
        content: { eyebrow: "", heading: "" },
      };
  }
}
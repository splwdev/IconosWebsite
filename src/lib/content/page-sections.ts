import { z } from "zod";
import { tierSchema } from "./pages";
import { isValidYouTubeUrl } from "./youtube";
 
export const SECTION_TYPES = [
  "hero",
  "text",
  "media",
  "media_text",
  "cta",
  "tiers",
  "services_grid",
  "programs_highlight",
  "testimonials",
  "blog_teaser",
  "issues",
  "features",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];
 
export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  text: "Text",
  media: "Media",
  media_text: "Media + Text",
  cta: "Call to Action",
  tiers: "Pricing Tiers",
  services_grid: "Services Grid",
  programs_highlight: "Programs Highlight",
  testimonials: "Testimonials",
  blog_teaser: "Blog Teaser",
  issues: "Issues We Resolve",
  features: "Feature Columns",
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

export const FEATURE_STYLES = ["light", "dark"] as const;
export type FeatureStyle = (typeof FEATURE_STYLES)[number];

/**
 * Links typed by staff into section fields end up in an <a href>. React does
 * not block `javascript:` URLs, so only site-relative paths, https, mailto
 * and tel are accepted. Protocol-relative ("//evil.com") is rejected too.
 */
export function isSafeHref(href: string): boolean {
  if (href.startsWith("/")) return !href.startsWith("//");
  return /^(https:\/\/|mailto:|tel:)/i.test(href);
}

const href = z
  .string()
  .min(1, "Required")
  .refine(isSafeHref, "Links must start with /, https://, mailto: or tel:");

/** List of short strings: trims each and drops blanks (admin edits these one per line). */
const lineList = z
  .array(z.string())
  .default([])
  .transform((items) => items.map((i) => i.trim()).filter((i) => i.length > 0));

/** Optional link: empty string means "no link", anything else must be safe. */
const optionalHref = z
  .string()
  .default("")
  .refine((v) => v === "" || isSafeHref(v), "Links must start with /, https://, mailto: or tel:");
 
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
    image_alt: z.string().default(""),
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
    image_alt: z.string().default(""),
    video_url: z.string(),
    body: z.string(),
    layout: z.enum(MEDIA_LAYOUTS),
    button_label: z.string().default(""),
    button_href: optionalHref,
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
  button_href: href,
  secondary_button_label: z.string().default(""),
  secondary_button_href: optionalHref,
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
  button_label: z.string().default(""),
  button_href: optionalHref,
});
export type TestimonialsSectionContent = z.infer<typeof testimonialsSectionContentSchema>;
 
export const blogTeaserSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
});
export type BlogTeaserSectionContent = z.infer<typeof blogTeaserSectionContentSchema>;

// ---------------------------------------------------------------------------
// Homepage redesign (October 2026 mockup) section types. All plain-text
// fields — rendered as React text, so no sanitisation needed — plus
// validated links.
// ---------------------------------------------------------------------------

export const heroCardSchema = z.object({
  eyebrow: z.string().default(""),
  title: z.string().min(1, "Card title is required"),
  summary: z.string().default(""),
  points: lineList,
  button_label: z.string().default("Learn more"),
  button_href: optionalHref,
  /** Spans the full width of the card grid (e.g. "Data protection training"). */
  wide: z.boolean().default(false),
});
export type HeroCard = z.infer<typeof heroCardSchema>;

export const heroSectionContentSchema = z.object({
  heading: z.string().min(1, "Required"),
  lead: z.string().default(""),
  image_url: z.string().nullable().default(null),
  image_alt: z.string().default(""),
  cards: z.array(heroCardSchema).default([]),
  footnote: z.string().default(""),
  footnote_link_label: z.string().default(""),
  footnote_link_href: optionalHref,
});
export type HeroSectionContent = z.infer<typeof heroSectionContentSchema>;

export const issuesSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  image_url: z.string().nullable().default(null),
  image_alt: z.string().default(""),
  /** Dark chips — e.g. commercial/contract issues. */
  primary_items: lineList,
  /** Light chips — e.g. data protection issues. */
  secondary_items: lineList,
  tagline: z.string().default(""),
  button_label: z.string().default(""),
  button_href: optionalHref,
});
export type IssuesSectionContent = z.infer<typeof issuesSectionContentSchema>;

export const featureItemSchema = z.object({
  title: z.string().min(1, "Required"),
  body: z.string().default(""),
});
export type FeatureItem = z.infer<typeof featureItemSchema>;

export const featuresSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  intro: z.string().default(""),
  style: z.enum(FEATURE_STYLES).default("dark"),
  items: z.array(featureItemSchema).default([]),
});
export type FeaturesSectionContent = z.infer<typeof featuresSectionContentSchema>;
 
export const pageSectionSchema = z.discriminatedUnion("section_type", [
  z.object({
    section_type: z.literal("hero"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: heroSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("issues"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: issuesSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("features"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: featuresSectionContentSchema,
  }),
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
          image_alt: "",
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
          image_alt: "",
          video_url: "",
          body: "",
          layout: "media-left",
          button_label: "",
          button_href: "",
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
        content: { eyebrow: "", heading: "", button_label: "", button_href: "" },
      };
    case "blog_teaser":
      return {
        section_type: "blog_teaser",
        background: "none",
        content: { eyebrow: "", heading: "" },
      };
    case "hero":
      return {
        section_type: "hero",
        background: "tint",
        content: {
          heading: "",
          lead: "",
          image_url: null,
          image_alt: "",
          cards: [],
          footnote: "",
          footnote_link_label: "",
          footnote_link_href: "",
        },
      };
    case "issues":
      return {
        section_type: "issues",
        background: "none",
        content: {
          eyebrow: "",
          heading: "",
          image_url: null,
          image_alt: "",
          primary_items: [],
          secondary_items: [],
          tagline: "",
          button_label: "",
          button_href: "",
        },
      };
    case "features":
      return {
        section_type: "features",
        background: "none",
        content: { eyebrow: "", heading: "", intro: "", style: "dark", items: [] },
      };
  }
}
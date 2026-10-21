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
  "steps",
  "text_checklist",
  "comparison",
  "testimonial_spotlight",
  "callout",
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
  steps: "Card Grid / Steps",
  text_checklist: "Text + Checklist",
  comparison: "Comparison",
  testimonial_spotlight: "Testimonial Spotlight",
  callout: "Callout Panel",
};
 
// These four render live data (published services/programs, testimonials,
// recent posts). They're offered on the homepage and section overview pages
// (e.g. /how-we-work lists its programs) — the admin editor filters the
// "+ Add section" list by page_type, though nothing at the schema/DB level
// actually forbids them elsewhere.
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
export const CARD_STYLES = ["filled", "outlined"] as const;
export const CALLOUT_LAYOUTS = ["stacked", "side"] as const;
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
 
/**
 * A pricing tier card. Extends the original name + description tier (still
 * used by the legacy pages.tiers column), so tier sections saved before the
 * price/features fields existed parse unchanged.
 */
export const tierCardSchema = tierSchema.extend({
  /** e.g. "£450" — free text so "From £450" or "POA" work too. */
  price: z.string().default(""),
  /** e.g. "+ VAT a month" */
  price_note: z.string().default(""),
  /** e.g. "Everything in Essential, plus:" */
  features_intro: z.string().default(""),
  features: lineList,
  button_label: z.string().default(""),
  button_href: optionalHref,
});
export type TierCard = z.infer<typeof tierCardSchema>;

export const tiersSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  tiers: z.array(tierCardSchema),
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
 
export const TESTIMONIALS_DISPLAYS = ["highlights", "all"] as const;

export const testimonialsSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  /**
   * highlights: testimonials ticked "Show on homepage", short quotes, three
   * across. all: every published testimonial with headline and full quote,
   * two across (the Clients page).
   */
  display: z.enum(TESTIMONIALS_DISPLAYS).default("highlights"),
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
  /** Small label above the title (card grids only), e.g. "Consultancy". */
  eyebrow: z.string().default(""),
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

export const CARD_GRID_COLUMNS = [3, 4] as const;

/**
 * A grid of short title + description cards. Numbered (01, 02…) for a
 * process like "Getting started"; un-numbered for benefits like "What you
 * get". Stored as section_type "steps" — the name predates the
 * un-numbered option.
 */
/** Optional highlighted (dark) card at the end of a card grid, e.g. "Need help with something else?". */
const finalCardSchema = z.object({
  title: z.string().default(""),
  body: z.string().default(""),
  link_label: z.string().default(""),
  link_href: optionalHref,
});

export const stepsSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  intro: z.string().default(""),
  numbered: z.boolean().default(true),
  columns: z.union([z.literal(3), z.literal(4)]).default(4),
  /** filled: cream/white cards. outlined: white cards with a thin border. */
  card_style: z.enum(CARD_STYLES).default("filled"),
  items: z.array(featureItemSchema).default([]),
  final_card: finalCardSchema.default({}),
});
export type StepsSectionContent = z.infer<typeof stepsSectionContentSchema>;

/** Lead paragraph(s) beside a bordered checklist card, e.g. "Ideal if…". */
export const textChecklistSectionContentSchema = z.object({
  /** Plain text; a blank line starts a new paragraph. */
  body: z.string().default(""),
  button_label: z.string().default(""),
  button_href: optionalHref,
  /** Small line under the button, ending in an optional link, e.g. "Need ongoing support? See [Managed Legal Services]". */
  note: z.string().default(""),
  note_link_label: z.string().default(""),
  note_link_href: optionalHref,
  /** Optional text after the link, e.g. "service." in "See our [Virtual DPO] service." */
  note_after: z.string().default(""),
  list_label: z.string().default(""),
  items: lineList,
  /** Divider lines between checklist items. */
  divided: z.boolean().default(false),
});
export type TextChecklistSectionContent = z.infer<typeof textChecklistSectionContentSchema>;

const comparisonColumnSchema = z.object({
  title: z.string().default(""),
  items: lineList,
});

/** Two columns compared side by side; the second is highlighted (dark) as the recommended option. */
export const comparisonSectionContentSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default(""),
  left: comparisonColumnSchema.default({}),
  right: comparisonColumnSchema.default({}),
});
export type ComparisonSectionContent = z.infer<typeof comparisonSectionContentSchema>;

/**
 * One testimonial from /admin/testimonials, referenced by id rather than
 * copied, so unpublishing it there removes it here too. Renders nothing for
 * the quote if the testimonial is missing or unpublished.
 */
export const testimonialSpotlightSectionContentSchema = z.object({
  testimonial_id: z.string().uuid().nullable().default(null),
  /** Shown in a dashed box when no testimonial is selected, e.g. "[Client testimonial, to follow]". */
  placeholder_text: z.string().default(""),
  /** Optional small heading and paragraph above the button. */
  heading: z.string().default(""),
  text: z.string().default(""),
  button_label: z.string().default(""),
  button_href: optionalHref,
});
export type TestimonialSpotlightSectionContent = z.infer<typeof testimonialSpotlightSectionContentSchema>;

const calloutBoxSchema = z.object({
  label: z.string().default(""),
  items: lineList,
  text: z.string().default(""),
});

/**
 * An outlined feature panel: badge, heading, text and a button, with small
 * info boxes alongside (e.g. "Data protection training"). `anchor` gives the
 * panel an id so other pages can link straight to it (/page#anchor).
 */
export const calloutSectionContentSchema = z.object({
  /** stacked: button under the text, dark border (VDPO training). side: button to the right, light border. */
  layout: z.enum(CALLOUT_LAYOUTS).default("stacked"),
  /** Plain small label above the heading (the badge is the pill version). */
  eyebrow: z.string().default(""),
  anchor: z
    .string()
    .default("")
    .refine((v) => v === "" || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v), "Lowercase letters, numbers and hyphens only"),
  badge: z.string().default(""),
  heading: z.string().default(""),
  body: z.string().default(""),
  note: z.string().default(""),
  button_label: z.string().default(""),
  button_href: optionalHref,
  boxes: z.array(calloutBoxSchema).default([]),
});
export type CalloutSectionContent = z.infer<typeof calloutSectionContentSchema>;
 
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
    section_type: z.literal("steps"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: stepsSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("text_checklist"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: textChecklistSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("comparison"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: comparisonSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("testimonial_spotlight"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: testimonialSpotlightSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("callout"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: calloutSectionContentSchema,
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

/**
 * Whether a page's sections already end in their own call to action
 * (a CTA section, or a spotlight with a button). Page templates only add
 * their fallback "Talk to us about…" button when this is false.
 */
export function hasOwnCallToAction(sections: PageSection[]): boolean {
  return sections.some(
    (s) =>
      s.section_type === "cta" ||
      (s.section_type === "testimonial_spotlight" && Boolean(s.content.button_label && s.content.button_href))
  );
}
 
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
      return { section_type: "tiers", background: "tint", content: { eyebrow: "", heading: "", tiers: [] } };
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
        content: { eyebrow: "", heading: "", display: "highlights", button_label: "", button_href: "" },
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
    case "steps":
      return {
        section_type: "steps",
        background: "tint",
        content: {
          eyebrow: "",
          heading: "",
          intro: "",
          numbered: true,
          card_style: "filled",
          columns: 4,
          items: [],
          final_card: { title: "", body: "", link_label: "", link_href: "" },
        },
      };
    case "text_checklist":
      return {
        section_type: "text_checklist",
        background: "none",
        content: {
          body: "",
          button_label: "",
          button_href: "",
          note: "",
          note_link_label: "",
          note_link_href: "",
          note_after: "",
          list_label: "",
          items: [],
          divided: false,
        },
      };
    case "comparison":
      return {
        section_type: "comparison",
        background: "none",
        content: { eyebrow: "", heading: "", left: { title: "", items: [] }, right: { title: "", items: [] } },
      };
    case "testimonial_spotlight":
      return {
        section_type: "testimonial_spotlight",
        background: "none",
        content: { testimonial_id: null, placeholder_text: "", heading: "", text: "", button_label: "", button_href: "" },
      };
    case "callout":
      return {
        section_type: "callout",
        background: "none",
        content: {
          layout: "stacked",
          eyebrow: "",
          anchor: "",
          badge: "",
          heading: "",
          body: "",
          note: "",
          button_label: "",
          button_href: "",
          boxes: [],
        },
      };
  }
}
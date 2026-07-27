import { z } from "zod";
import { tierSchema } from "./pages";
import { isValidYouTubeUrl } from "./youtube";
 
export const SECTION_TYPES = ["text", "media", "media_text", "cta", "tiers"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];
 
export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  text: "Text",
  media: "Media",
  media_text: "Media + Text",
  cta: "Call to Action",
  tiers: "Pricing Tiers",
};
 
export const MEDIA_TYPES = ["image", "video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
 
export const MEDIA_SIZES = ["small", "medium", "large"] as const;
export type MediaSize = (typeof MEDIA_SIZES)[number];
 
export const MEDIA_LAYOUTS = ["media-left", "media-right"] as const;
export type MediaLayout = (typeof MEDIA_LAYOUTS)[number];
 
export const SECTION_BACKGROUNDS = ["none", "tint"] as const;
export type SectionBackground = (typeof SECTION_BACKGROUNDS)[number];
 
export const textSectionContentSchema = z.object({
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
  if (data.media_type === "video" && !isValidYouTubeUrl(data.video_url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["video_url"],
      message: "Enter a valid YouTube URL",
    });
  }
  if (data.media_type === "image" && !data.image_url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["image_url"],
      message: "Upload an image",
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
    media_type: z.enum(MEDIA_TYPES),
    image_url: z.string().nullable(),
    video_url: z.string(),
    body: z.string(),
    layout: z.enum(MEDIA_LAYOUTS),
  })
  .superRefine(checkMediaFields);
export type MediaTextSectionContent = z.infer<typeof mediaTextSectionContentSchema>;
 
// heading/body/button_label/button_href are plain strings rendered as
// text, not HTML — no rich-text editor and no sanitization needed here,
// React already escapes them by default.
export const ctaSectionContentSchema = z.object({
  heading: z.string().min(1, "Required"),
  body: z.string(),
  button_label: z.string().min(1, "Required"),
  button_href: z.string().min(1, "Required"),
});
export type CtaSectionContent = z.infer<typeof ctaSectionContentSchema>;
 
export const tiersSectionContentSchema = z.object({
  tiers: z.array(tierSchema),
});
export type TiersSectionContent = z.infer<typeof tiersSectionContentSchema>;
 
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
]);
 
export type PageSection = z.infer<typeof pageSectionSchema>;
 
export function createBlankSection(type: SectionType): PageSection {
  switch (type) {
    case "text":
      return { section_type: "text", background: "none", content: { body: "" } };
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
        content: { heading: "", body: "", button_label: "Get in touch", button_href: "/contact" },
      };
    case "tiers":
      return { section_type: "tiers", background: "none", content: { tiers: [] } };
  }
}
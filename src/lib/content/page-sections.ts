import { z } from "zod";
import { tierSchema } from "./pages";
 
export const SECTION_TYPES = ["text", "image_text", "cta", "tiers"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];
 
export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  text: "Text",
  image_text: "Image + Text",
  cta: "Call to Action",
  tiers: "Pricing Tiers",
};
 
export const IMAGE_TEXT_LAYOUTS = ["image-left", "image-right"] as const;
export type ImageTextLayout = (typeof IMAGE_TEXT_LAYOUTS)[number];
 
export const textSectionContentSchema = z.object({
  body: z.string(),
});
export type TextSectionContent = z.infer<typeof textSectionContentSchema>;
 
export const imageTextSectionContentSchema = z.object({
  image_url: z.string().nullable(),
  body: z.string(),
  layout: z.enum(IMAGE_TEXT_LAYOUTS),
});
export type ImageTextSectionContent = z.infer<typeof imageTextSectionContentSchema>;
 
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
 
export const SECTION_BACKGROUNDS = ["none", "tint"] as const;
export type SectionBackground = (typeof SECTION_BACKGROUNDS)[number];
 
export const pageSectionSchema = z.discriminatedUnion("section_type", [
  z.object({
    section_type: z.literal("text"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: textSectionContentSchema,
  }),
  z.object({
    section_type: z.literal("image_text"),
    background: z.enum(SECTION_BACKGROUNDS),
    content: imageTextSectionContentSchema,
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
    case "image_text":
      return {
        section_type: "image_text",
        background: "none",
        content: { image_url: null, body: "", layout: "image-left" },
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
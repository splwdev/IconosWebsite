import { z } from "zod";
import { ALLOWED_FONTS } from "./fonts";

const hex = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex colour, e.g. #772035");

export const themeTokensSchema = z.object({
  font_display: z.enum(ALLOWED_FONTS as [string, ...string[]]),
  font_body: z.enum(ALLOWED_FONTS as [string, ...string[]]),
  colors: z.object({
    dark: hex,
    darker: hex,
    accent: hex,
    accent_soft: hex,
    cream: hex,
    white: hex,
  }),
  radius: z.enum(["pill", "rounded", "square"]),
});

export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export type ThemeStatus = "draft" | "published" | "archived";

export interface Theme {
  id: string;
  name: string;
  slug: string;
  status: ThemeStatus;
  tokens: ThemeTokens;
  notes: string | null;
  updated_at: string;
}

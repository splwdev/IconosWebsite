import type { Metadata } from "next";
import { getActiveTheme } from "@/lib/theme/get-active-theme";
import { themeToCssVariables } from "@/lib/theme/css-vars";
import { buildGoogleFontsUrl } from "@/lib/theme/fonts";
import { PreviewBanner } from "@/components/preview-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iconos Group | Commercially Focused Legal Support",
  description:
    "Iconos Group is an SRA-regulated commercial legal consultancy acting as your outsourced in-house counsel, for a fixed monthly fee.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, isPreview } = await getActiveTheme();
  const fontsUrl = buildGoogleFontsUrl([
    theme.tokens.font_display,
    theme.tokens.font_body,
  ]);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={fontsUrl} />
        {/* Rendered server-side from the resolved theme — no flash of
            unstyled content, and works with JS disabled. */}
        <style dangerouslySetInnerHTML={{ __html: themeToCssVariables(theme.tokens) }} />
      </head>
      <body>
        {isPreview && <PreviewBanner themeName={theme.name} />}
        {children}
      </body>
    </html>
  );
}

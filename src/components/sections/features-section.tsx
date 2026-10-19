import type { FeaturesSectionContent } from "@/lib/content/page-sections";
import { SectionEyebrow, SectionTitle, mutedText } from "./section-primitives";

/**
 * Up to four short value statements in columns, e.g. "Why Iconos".
 * The dark style paints its own panel (like the dark CTA), so the section
 * background toggle has no visible effect on it.
 */
export function FeaturesSection({ content }: { content: FeaturesSectionContent }) {
  const { eyebrow, heading, intro, style, items } = content;
  const isDark = style === "dark";
  const tone = isDark ? "light" : "dark";

  return (
    <div className={isDark ? "rounded-3xl bg-brand-dark px-6 py-10 sm:px-10 sm:py-12" : ""}>
      <div className="max-w-3xl">
        <SectionEyebrow tone={tone}>{eyebrow}</SectionEyebrow>
        <SectionTitle tone={tone}>{heading}</SectionTitle>
        {intro && (
          <p className={`mt-3 text-base sm:text-lg ${isDark ? "text-white/75" : mutedText}`}>{intro}</p>
        )}
      </div>
      {items.length > 0 && (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map((item) => (
            <li
              key={item.title}
              className={`border-t pt-5 ${isDark ? "border-white/20" : "border-brand-dark/15"}`}
            >
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-brand-dark"}`}>
                {item.title}
              </h3>
              {item.body && (
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-white/75" : mutedText}`}>
                  {item.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

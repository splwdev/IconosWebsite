/**
 * Derives an SEO meta description from existing content — no AI call, pure
 * deterministic text processing. Strips HTML tags, collapses whitespace,
 * and trims to a target length on a clean word boundary (never mid-word),
 * aiming for the commonly-cited 150–160 character sweet spot search
 * engines display without truncating.
 *
 * Prefers `primary` (e.g. a post's excerpt or a page's summary — already
 * human-written and usually already close to the right length) and only
 * falls back to stripping the rich-text `body` if primary is empty or too
 * short to be useful on its own.
 */
export function generateMetaDescription(
  primary: string,
  body: string,
  targetLength = 155
): string {
  const cleanPrimary = collapseWhitespace(primary);
  const source =
    cleanPrimary.length >= 40 ? cleanPrimary : `${cleanPrimary} ${stripHtml(body)}`.trim();
 
  return truncateAtWordBoundary(collapseWhitespace(source), targetLength);
}
 
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}
 
function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
 
function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
 
  // Leave room for an ellipsis, then back off to the last full word.
  const hardCut = text.slice(0, maxLength - 1);
  const lastSpace = hardCut.lastIndexOf(" ");
  const trimmed = lastSpace > 0 ? hardCut.slice(0, lastSpace) : hardCut;
 
  return `${trimmed.replace(/[.,;:!?-]+$/, "")}…`;
}
/**
 * SRA digital badge — the SRA Transparency Rules require firms to display
 * it on their website. It must be the SRA's live iframe (it shows today's
 * date and links to the firm's register entry); a static image of the
 * badge, as in the design mockup, is not compliant.
 *
 * Set NEXT_PUBLIC_SRA_BADGE_URL to the firm-specific iframe URL from the
 * SRA (format: https://cdn.yoshki.com/iframe/<id>r.html — available from
 * mySRA). Until then a plain link to the SRA register is shown instead.
 * cdn.yoshki.com is allowed in frame-src in next.config.ts / src/middleware.ts.
 */
const SRA_NUMBER = "831403";
const REGISTER_URL = `https://www.sra.org.uk/consumers/register/organisation/?sraNumber=${SRA_NUMBER}`;

export function getSraBadgeUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SRA_BADGE_URL ?? "";
  return /^https:\/\/cdn\.yoshki\.com\/iframe\/[\w-]+\.html$/.test(url) ? url : null;
}

export function SraBadge() {
  const badgeUrl = getSraBadgeUrl();

  if (badgeUrl) {
    return (
      <div className="w-full max-w-[275px] shrink-0">
        <div className="relative overflow-hidden pb-[59.1%]">
          <iframe
            src={badgeUrl}
            title="Solicitors Regulation Authority digital badge"
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    );
  }

  return (
    <a
      href={REGISTER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 flex-col rounded-lg border border-brand-dark/15 px-4 py-3 text-xs text-brand-dark hover:bg-brand-cream"
    >
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]">Regulated by</span>
      <span className="mt-1 font-semibold">Solicitors Regulation Authority</span>
      <span className="text-brand-dark/75">
        SRA number {SRA_NUMBER}
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
    </a>
  );
}

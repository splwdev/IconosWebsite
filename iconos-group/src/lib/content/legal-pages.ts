export interface LegalPage {
  slug: string;
  title: string;
  body: string[];
  pendingClientReview: boolean;
}

export const REGULATORY_STATEMENT =
  "Iconos Group Limited is authorised and regulated by the Solicitors Regulation Authority under SRA Number 831403. Registered in England and Wales with number 13290040. Registered office: 25 Norwich Way, Croxley Green, WD3 3SP.";

// The disclaimer text is the client's own exact wording from the completed
// questionnaire (Q35) — used verbatim because it was supplied directly for
// this purpose, not sourced from elsewhere.
export const LEGAL_DISCLAIMER_TEXT =
  "This website contains general information only, and is not intended to constitute legal or other professional advice. For professional advice, please contact us at legal@iconos-group.com. Whilst we try to ensure that the information contained on this website is accurate, Iconos Group assumes no responsibility for such information and disclaims all liability in respect of it.";

// Q34: the client wants to review Privacy, Cookie, Complaints and Terms
// before reuse rather than porting the existing text as-is, so these are
// clearly marked placeholders, not final copy.
export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    body: [
      "[Placeholder — Iconos Group to review and supply final Privacy Policy wording before launch, per their request to update rather than reuse the current site's text.]",
    ],
    pendingClientReview: true,
  },
  {
    slug: "complaints-policy",
    title: "Complaints Policy",
    body: [
      "[Placeholder — Iconos Group to review and supply final Complaints Policy wording before launch.]",
    ],
    pendingClientReview: true,
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    body: [
      "[Placeholder — Iconos Group to review and supply final Cookie Policy wording before launch. Should be updated to reflect the new site's actual cookie usage once analytics/Turnstile are implemented.]",
    ],
    pendingClientReview: true,
  },
  {
    slug: "website-terms-and-conditions",
    title: "Website Terms & Conditions",
    body: [
      "[Placeholder — Iconos Group to review and supply final Website Terms & Conditions before launch.]",
    ],
    pendingClientReview: true,
  },
  {
    slug: "legal-disclaimer",
    title: "Legal Disclaimer",
    body: [LEGAL_DISCLAIMER_TEXT],
    pendingClientReview: false,
  },
];

export function getLegalPageBySlug(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug);
}

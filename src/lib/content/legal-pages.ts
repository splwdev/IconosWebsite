export interface LegalPage {
  slug: string;
  title: string;
  body: string[];
  pendingClientReview: boolean;
  /** Extra context shown alongside the standard "pending review" banner, for pages with a more specific compliance risk than the others. */
  reviewNote?: string;
}
 
export const REGULATORY_STATEMENT =
  "Iconos Group Limited is authorised and regulated by the Solicitors Regulation Authority under SRA Number 831403. Registered in England and Wales with number 13290040. Registered office: 25 Norwich Way, Croxley Green, WD3 3SP.";
 
// The disclaimer text is the client's own exact wording from the completed
// questionnaire (Q35) — used verbatim because it was supplied directly for
// this purpose, not sourced from elsewhere.
export const LEGAL_DISCLAIMER_TEXT =
  "This website contains general information only, and is not intended to constitute legal or other professional advice. For professional advice, please contact us at legal@iconos-group.com. Whilst we try to ensure that the information contained on this website is accurate, Iconos Group assumes no responsibility for such information and disclaims all liability in respect of it.";
 
// Q34: the client wants to review Privacy, Cookie, Complaints and Terms
// before reuse rather than porting the existing site's text as-is. These
// are substantial generic drafts — a real structural starting point, not
// bracketed placeholders — but are still explicitly not final copy. None
// of this is legal advice; it needs the client's own (or their own
// counsel's) review before launch, same as the original plan.
export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    pendingClientReview: true,
    body: [
      "Iconos Group Limited (\"Iconos Group\", \"we\", \"us\") is committed to protecting your privacy. This policy explains what personal data we collect through this website, why we collect it, and what rights you have over it.",
      "Information we collect. When you use our contact form, we collect your name, company name, email address, phone number, and the details of your enquiry. We use Cloudflare Turnstile to help distinguish genuine enquiries from automated spam; this may involve limited technical data being processed by Cloudflare as part of that check.",
      "How we use your information. We use the information you provide solely to respond to your enquiry and, where relevant, to progress a potential or existing client relationship. We do not sell or rent your personal data to third parties.",
      "Legal basis for processing. We process your data on the basis of our legitimate interest in responding to enquiries about our services, and, where a client relationship is established, to take steps in connection with a contract.",
      "Sharing your information. We use third-party service providers to operate this website and deliver enquiries to us, including Supabase (database and hosting infrastructure) and Microsoft (email delivery). These providers process data on our behalf and are bound by appropriate data processing terms.",
      "Data retention. We retain enquiry data for as long as reasonably necessary to respond to your enquiry and for our legitimate business records, after which it is deleted.",
      "Your rights. Under UK data protection law, you have the right to request access to, correction of, or deletion of your personal data, and to object to or restrict how we use it. To exercise any of these rights, contact us at legal@iconos-group.com.",
      "Cookies. See our separate Cookie Policy for details of the cookies used on this site.",
      "Changes to this policy. We may update this policy from time to time; the current version will always be available on this page.",
      "Contact us. If you have any questions about this policy or how we handle your data, please contact us at legal@iconos-group.com.",
    ],
  },
  {
    slug: "complaints-policy",
    title: "Complaints Policy",
    pendingClientReview: true,
    reviewNote:
      "As an SRA-regulated firm, your complaints procedure has specific requirements under the SRA Code of Conduct — including informing clients of their right to complain to the Legal Ombudsman and the applicable time limits. Treat this draft as a structural starting point only; it must be reviewed against your actual complaints-handling procedure and current SRA requirements before publishing.",
    body: [
      "We are committed to providing a high-quality service to all our clients. If you are unhappy with any aspect of our service, we want to know so that we can put things right.",
      "How to make a complaint. In the first instance, please raise your concern directly with the person handling your matter, or with the Firm's Founder, by emailing legal@iconos-group.com with details of your complaint.",
      "What happens next. We will acknowledge your complaint promptly and investigate it fairly. We aim to provide a full written response within a reasonable timeframe, setting out our findings and any proposed resolution.",
      "If you remain unhappy. If you are not satisfied with our response, you may be entitled to refer your complaint to the Legal Ombudsman, who deals with complaints about legal services in England and Wales. There are usually time limits on referring a complaint to the Legal Ombudsman, so please do not delay in raising any concerns.",
      "Alternative options. You may also be entitled to raise certain concerns directly with the Solicitors Regulation Authority, where these relate to our professional conduct rather than the level of service provided.",
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    pendingClientReview: true,
    body: [
      "This policy explains how Iconos Group uses cookies and similar technologies on this website, and reflects what the site actually uses today — it should be reviewed and updated whenever the site's functionality changes (for example, if analytics is added in future).",
      "Strictly necessary cookies. If you sign in to our staff admin area, we use a session cookie (via our database provider, Supabase) to keep you securely signed in. This cookie is essential to that functionality and is not used for tracking or advertising.",
      "Security and bot-protection. Our contact form uses Cloudflare Turnstile to help prevent spam and automated abuse. This may involve limited technical data being processed by Cloudflare as part of verifying that a form submission is genuine.",
      "No advertising or marketing cookies. This site does not currently use cookies for advertising, marketing, or cross-site tracking purposes, and we do not currently run any analytics tooling that sets cookies.",
      "Managing cookies. Most web browsers let you control cookies through their settings. Restricting cookies may affect the functionality of some parts of this site, particularly the staff admin area.",
      "Changes to this policy. If we introduce new tools that use cookies (for example, website analytics), we will update this policy to reflect that before those tools go live.",
    ],
  },
  {
    slug: "website-terms-and-conditions",
    title: "Website Terms & Conditions",
    pendingClientReview: true,
    body: [
      "These terms govern your use of this website. By using this site, you accept these terms in full. If you disagree with any part of these terms, please do not use this website.",
      "Intellectual property. Unless otherwise stated, Iconos Group Limited owns the intellectual property rights in this website and its content, including text, graphics, and logos. You may view and print pages from this site for your own personal, non-commercial use, subject to the restrictions set out in these terms.",
      "Acceptable use. You must not use this website in any way that causes, or may cause, damage to the website or impairment of its availability, or in any way that is unlawful, fraudulent, or harmful.",
      "No professional advice. Content on this website is provided for general information purposes only and does not constitute legal or other professional advice. See our Legal Disclaimer for further detail.",
      "Limitation of liability. To the fullest extent permitted by law, Iconos Group excludes liability for any loss or damage arising from your use of this website, whether direct or indirect.",
      "Links to other websites. This website may contain links to third-party websites. We have no control over, and accept no responsibility for, the content of those websites.",
      "Governing law. These terms are governed by, and construed in accordance with, the laws of England and Wales, and any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts of England and Wales.",
      "Changes to these terms. We may revise these terms at any time by updating this page. Please check this page periodically to ensure you are aware of any changes.",
    ],
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
export interface NavLink {
  label: string;
  href: string;
}
 
export interface NavGroup {
  label: string;
  href: string; // overview page
  children: NavLink[];
  /**
   * Whether the dropdown links to the overview page (as "Overview" on
   * desktop, and the group label itself on mobile). False keeps the
   * overview page live but out of the nav.
   */
  showOverview?: boolean;
}
 
/**
 * Builds the full primary nav for a request, splicing the dynamically
 * fetched Service/Program pages (see getPublicNavGroups in public-nav.ts,
 * called from (site)/layout.tsx) into their dropdowns. Static entries
 * (Who We Are, Clients, Work With Us, Blog) are unrelated to the Pages
 * system and unaffected by it.
 */
export function buildPrimaryNav(
  whatWeDoChildren: NavLink[],
  howWeWorkChildren: NavLink[],
  customLinks: NavLink[] = [],
  /** The Blog link only shows while the Blog is switched on (admin → Settings). */
  showBlog = true
): Array<NavLink | NavGroup> {
  return [
    // Order follows the approved homepage mockup (Oct 2026).
    { label: "How We Work", href: "/how-we-work", children: howWeWorkChildren },
    // The What We Do overview page still exists but isn't in the current
    // wireframes, so it's left out of the nav (Oct 2026). Set to true to
    // bring it back.
    { label: "What We Do", href: "/what-we-do", children: whatWeDoChildren, showOverview: false },
    { label: "Who We Are", href: "/who-we-are" },
    { label: "Clients", href: "/clients" },
    { label: "Work With Us", href: "/work-with-us" },
    ...(showBlog ? [{ label: "Blog", href: "/blog" }] : []),
    ...customLinks,
  ];
}
 
export const LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Complaints Policy", href: "/legal/complaints-policy" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
  { label: "Website Terms & Conditions", href: "/legal/website-terms-and-conditions" },
  { label: "Legal Disclaimer", href: "/legal/legal-disclaimer" },
];
 
export function isNavGroup(item: NavLink | NavGroup): item is NavGroup {
  return "children" in item;
}
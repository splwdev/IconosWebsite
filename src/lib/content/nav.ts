export interface NavLink {
  label: string;
  href: string;
}
 
export interface NavGroup {
  label: string;
  href: string; // overview page
  children: NavLink[];
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
  customLinks: NavLink[] = []
): Array<NavLink | NavGroup> {
  return [
    { label: "Who We Are", href: "/who-we-are" },
    { label: "What We Do", href: "/what-we-do", children: whatWeDoChildren },
    { label: "How We Work", href: "/how-we-work", children: howWeWorkChildren },
    { label: "Clients", href: "/clients" },
    { label: "Work With Us", href: "/work-with-us" },
    { label: "Blog", href: "/blog" },
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
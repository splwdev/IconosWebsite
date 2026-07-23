export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  href: string; // overview page
  children: NavLink[];
}

export const WHAT_WE_DO_GROUP: NavGroup = {
  label: "What We Do",
  href: "/what-we-do",
  children: [
    { label: "Corporate", href: "/what-we-do/corporate" },
    { label: "Commercial", href: "/what-we-do/commercial" },
    { label: "Data Protection & GDPR", href: "/what-we-do/data-protection-gdpr" },
    { label: "IP", href: "/what-we-do/ip" },
    { label: "Employment", href: "/what-we-do/employment" },
    { label: "Mergers & Acquisitions", href: "/what-we-do/mergers-and-acquisitions" },
  ],
};

export const HOW_WE_WORK_GROUP: NavGroup = {
  label: "How We Work",
  href: "/how-we-work",
  children: [
    { label: "Subscription Model", href: "/how-we-work/subscription-model" },
    {
      label: "Virtual Data Protection Officer",
      href: "/how-we-work/virtual-data-protection-officer",
    },
    { label: "Ad Hoc / One-Off Work", href: "/how-we-work/ad-hoc-work" },
  ],
};

export const PRIMARY_NAV: Array<NavLink | NavGroup> = [
  { label: "Who We Are", href: "/who-we-are" },
  WHAT_WE_DO_GROUP,
  HOW_WE_WORK_GROUP,
  { label: "Clients", href: "/clients" },
  { label: "Work With Us", href: "/work-with-us" },
  { label: "Blog", href: "/blog" },
];

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

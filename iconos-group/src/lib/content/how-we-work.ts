export interface PricingTier {
  name: string;
  description: string;
}

export interface WorkProgram {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  intro: string;
  points: string[];
  tiers?: PricingTier[];
}

export const WORK_PROGRAMS: WorkProgram[] = [
  {
    slug: "subscription-model",
    title: "Managed Legal Services",
    tag: "Subscription",
    summary: "One fixed monthly cost. No surprise invoices.",
    intro:
      "Ongoing embedded legal support across corporate, commercial and employment matters, scaled to the size of your business. Starts from as little as one hour a month, so you can try it, see the value, and adjust as you grow.",
    points: [
      "A single predictable monthly fee, agreed upfront",
      "Access to the team, not just one lawyer",
      "Scales up or down as your needs change",
      "No meter running on every question you ask",
    ],
  },
  {
    slug: "virtual-data-protection-officer",
    title: "Virtual Data Protection Officer",
    tag: "Three tiers",
    summary: "Outsourced DPO support so you stay compliant without hiring in-house.",
    intro:
      "Data protection compliance without a full-time hire. Choose the tier that matches your risk profile and data volumes, and move between tiers as your business changes.",
    points: [
      "A named DPO contact, not a rotating helpdesk",
      "Practical, business-first compliance advice",
      "Ongoing monitoring, not a one-off audit",
    ],
    tiers: [
      {
        name: "Essential",
        description: "Core DPO oversight for smaller data volumes and lower-risk processing.",
      },
      {
        name: "Standard",
        description: "Regular reviews and hands-on support for growing data processing needs.",
      },
      {
        name: "Comprehensive",
        description: "Full DPO service for complex or higher-risk data processing at scale.",
      },
    ],
  },
  {
    slug: "ad-hoc-work",
    title: "Ad Hoc / One-Off Work",
    tag: "No subscription required",
    summary: "Support for a single matter, without committing to an ongoing arrangement.",
    intro:
      "Not every business is ready for a subscription, and not every need is ongoing. We take on one-off matters alongside our subscription clients, quoted clearly upfront.",
    points: [
      "No ongoing commitment required",
      "Clear, agreed pricing before work begins",
      "The same commercially minded approach as our subscription clients",
    ],
  },
];

export function getWorkProgramBySlug(slug: string): WorkProgram | undefined {
  return WORK_PROGRAMS.find((p) => p.slug === slug);
}

export interface Service {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  points: string[];
}

// NOTE: copy below is a reasonable working draft based on the questionnaire
// and current site, marked for the client's own review before go-live —
// Q22 confirms Iconos will rewrite/update text themselves.
export const SERVICES: Service[] = [
  {
    slug: "corporate",
    title: "Corporate",
    summary: "Structuring, governance and transactions handled commercially, not just correctly.",
    intro:
      "From company formation through to governance and shareholder matters, we support founders and boards with corporate legal work that keeps pace with a growing business.",
    points: [
      "Company formation and group structuring",
      "Shareholder agreements and cap table matters",
      "Corporate governance and board support",
      "Investment and funding round documentation",
    ],
  },
  {
    slug: "commercial",
    title: "Commercial",
    summary: "Contracts that help close deals, not stall them.",
    intro:
      "We work alongside your sales team so contracts move at the speed of the deal, not the speed of a law firm's turnaround time.",
    points: [
      "Customer and supplier contracts",
      "Terms of service and SaaS agreements",
      "Partnership and reseller agreements",
      "Contract review turned around fast, in plain English",
    ],
  },
  {
    slug: "data-protection-gdpr",
    title: "Data Protection & GDPR",
    summary: "Practical compliance, not box-ticking — and the foundation of our Virtual DPO service.",
    intro:
      "Data protection risk builds quietly when nobody owns it day to day. We help growing businesses put real, working compliance in place, sized to the business.",
    points: [
      "GDPR and UK data protection compliance",
      "Data processing agreements and privacy notices",
      "Data breach response support",
      "Ongoing Virtual DPO service across three tiers",
    ],
  },
  {
    slug: "ip",
    title: "IP",
    summary: "Protecting what makes you different.",
    intro:
      "Your intellectual property is often the most valuable thing your business owns. We help you identify, protect and commercialise it.",
    points: [
      "IP audits and protection strategy",
      "Licensing and assignment agreements",
      "Software and technology IP",
      "Brand and trade mark considerations",
    ],
  },
  {
    slug: "employment",
    title: "Employment",
    summary: "Clear, fair, low-risk people decisions.",
    intro:
      "Employment law touches every stage of growth, from your first hire to restructuring. We keep it practical and grounded in commercial reality.",
    points: [
      "Contracts of employment and consultancy agreements",
      "Policies and staff handbooks",
      "Disciplinary, grievance and exit support",
      "Restructuring and redundancy guidance",
    ],
  },
  {
    slug: "mergers-and-acquisitions",
    title: "Mergers & Acquisitions",
    summary: "Deal support from term sheet to close.",
    intro:
      "Whether you're acquiring, being acquired, or merging, we provide commercially minded M&A support that keeps the deal moving.",
    points: [
      "Due diligence, buy-side and sell-side",
      "Heads of terms and deal structuring",
      "Sale and purchase agreements",
      "Post-completion integration support",
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

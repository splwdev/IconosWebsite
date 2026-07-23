export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string[];
  publishedAt: string; // ISO date
}

// Static placeholders standing in for the weekly blog content mentioned in
// Q17/Q26. These will move to a `posts` table with a staff-authored admin
// editor once the Blog CMS task is built — this file just proves out the
// public-facing blog routes and layout in the meantime.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "five-dpo-myths-costing-smes-money",
    title: "Five DPO myths costing SMEs money",
    category: "Data Protection",
    excerpt: "What a Virtual DPO actually covers, and why 'too small to need one' is usually wrong.",
    body: [
      "Many growing businesses assume data protection oversight is only worth paying for once you're processing data at real scale. In practice, the risk shows up long before that — in the gap between having a privacy policy and someone actually keeping it current.",
      "A Virtual DPO doesn't need to mean a large fixed cost. Our tiered model exists precisely so a 15-person business and a 150-person business can both get a named point of contact without over-paying for oversight they don't yet need.",
    ],
    publishedAt: "2026-07-01",
  },
  {
    slug: "contracts-that-help-you-close-not-stall",
    title: "Contracts that help you close, not stall",
    category: "Commercial",
    excerpt: "Where sales and legal should meet — and why 'legally watertight' isn't the only test.",
    body: [
      "The traditional model treats legal review as a gate at the end of the sales process. We think that's backwards. Our test for a contract isn't just 'is this legally watertight in isolation' — it's 'does this help you close the deal and protect your margin'.",
      "That means being available while the deal is live, not two weeks after the prospect has cooled off.",
    ],
    publishedAt: "2026-07-08",
  },
  {
    slug: "when-to-move-from-ad-hoc-to-subscription",
    title: "When to move from ad hoc to subscription",
    category: "Corporate",
    excerpt: "Signs you've outgrown reactive legal help, before it costs you.",
    body: [
      "Ad hoc legal support works well until the gaps between problems start shrinking. If you're contacting a lawyer more than once a quarter, it's usually cheaper — and safer — to have someone keeping an eye on things continuously.",
      "Our subscription model is designed to make that transition low-risk: start from as little as one hour a month and scale from there.",
    ],
    publishedAt: "2026-07-15",
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

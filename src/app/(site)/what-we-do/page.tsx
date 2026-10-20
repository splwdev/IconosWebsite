import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/content/pages";
 
export const metadata: Metadata = {
  title: "What We Do | Iconos Group",
  description:
    "Legal support across corporate, commercial, data protection & GDPR, IP, employment, and M&A.",
};
 
async function getServices(): Promise<Page[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("parent_section", "what-we-do")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  return (data as Page[] | null) ?? [];
}
 
export default async function WhatWeDoPage() {
  const services = await getServices();
 
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Legal support across the areas that matter to growing businesses."
        intro="We only practise in corporate, commercial, and data protection law — so you always know exactly what you're getting."
      />
      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/5 bg-black/5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Link
                key={service.slug}
                href={`/what-we-do/${service.slug}`}
                className="bg-white p-8 transition-colors hover:bg-brand-cream"
              >
                <span className="mb-4 block text-xs font-bold text-brand-accent">
                  0{i + 1}
                </span>
                <h2 className="mb-2 text-h3 font-semibold text-brand-dark">{service.title}</h2>
                <p className="text-sm leading-relaxed text-neutral-500">{service.summary}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
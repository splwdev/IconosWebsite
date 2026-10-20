import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/content/pages";
 
export const metadata: Metadata = {
  title: "How We Work | Iconos Group",
  description:
    "Managed Legal Services, a tiered Virtual Data Protection Officer service, and ad hoc work — one fixed monthly cost, no surprise invoices.",
};
 
async function getPrograms(): Promise<Page[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("parent_section", "how-we-work")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  return (data as Page[] | null) ?? [];
}
 
export default async function HowWeWorkPage() {
  const programs = await getPrograms();
 
  return (
    <>
      <PageHero
        eyebrow="How we work"
        title="One fixed monthly cost. No surprise invoices."
        intro="Most firms bill by the hour, which makes clients afraid to ask questions. We run on a subscription model — one predictable monthly budget, no hidden extras."
      />
      <Section>
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {programs.map((program) => (
            <Link
              key={program.slug}
              href={`/how-we-work/${program.slug}`}
              className="rounded-2xl border border-black/10 p-8 transition-colors hover:bg-brand-cream"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-accent">
                {program.tag}
              </p>
              <h2 className="mb-3 text-h3 font-semibold text-brand-dark">{program.title}</h2>
              <p className="text-sm leading-relaxed text-neutral-600">{program.summary}</p>
            </Link>
          ))}
        </Container>
      </Section>
    </>
  );
}
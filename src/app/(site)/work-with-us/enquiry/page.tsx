import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui";
import { EnquirySidebar } from "@/components/enquiry-sidebar";
import { WorkWithUsForm } from "@/components/work-with-us-form";
import { parseInterestParam } from "@/lib/contact/work-with-us";
import { loadContactFormSettings } from "@/lib/settings/load-contact-form";

export const metadata: Metadata = {
  title: "Work With Us — Get in Touch | Iconos Group",
  description:
    "Consultant lawyers and referral partners: tell us a little about yourself and how you'd like to work with Iconos Group.",
  alternates: { canonical: "/work-with-us/enquiry" },
};

export default async function WorkWithUsGetInTouchPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string | string[] }>;
}) {
  // Turnstile's script needs this request's CSP nonce (see middleware.ts).
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const { interest } = await searchParams;
  const initialInterest = parseInterestParam(interest);
  const settings = await loadContactFormSettings();

  return (
    <>
      <PageHero eyebrow="Work with us" title={settings.wwu_page_title} intro={settings.wwu_page_intro} />
      <Container className="pb-20 pt-12 sm:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <WorkWithUsForm
            key={initialInterest ?? "none"}
            nonce={nonce}
            initialInterest={initialInterest}
            directEmail={settings.direct_email}
          />
          <EnquirySidebar steps={settings.wwu_next_steps} email={settings.direct_email} phone={settings.direct_phone}>
            {settings.wwu_help_text && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7">
                <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark/70">
                  Looking for legal support?
                </h2>
                <p className="mt-3 text-sm text-brand-dark/80">{settings.wwu_help_text}</p>
                <Link href="/contact" className="mt-4 inline-block text-sm font-semibold text-brand-dark underline underline-offset-2">
                  Go to the enquiry form
                </Link>
              </div>
            )}
          </EnquirySidebar>
        </div>
      </Container>
    </>
  );
}

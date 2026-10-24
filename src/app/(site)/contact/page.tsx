import type { Metadata } from "next";
import { headers } from "next/headers";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { EnquirySidebar } from "@/components/enquiry-sidebar";
import { parseServiceParam } from "@/lib/contact/enquiry";
import { loadContactFormSettings } from "@/lib/settings/load-contact-form";

export const metadata: Metadata = {
  title: "Contact | Iconos Group",
  description:
    "Tell us about your business and what you need — Managed Legal Services, Virtual DPO, data protection training or help with a specific matter.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  // The Turnstile widget loads an external script — under our
  // 'strict-dynamic' CSP, that script tag must carry this request's nonce
  // to be trusted (see src/middleware.ts).
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const { service } = await searchParams;
  const initialService = parseServiceParam(service);
  const settings = await loadContactFormSettings();

  return (
    <>
      <PageHero eyebrow="Contact us" title="Let's talk about your business." intro={settings.page_intro} />
      <Container className="pb-20 pt-12 sm:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <ContactForm
            // Re-mount when arriving from a different service link.
            key={initialService ?? "none"}
            nonce={nonce}
            initialService={initialService}
            directEmail={settings.direct_email}
          />

          <EnquirySidebar
            steps={settings.next_steps}
            email={settings.direct_email}
            phone={settings.direct_phone}
          />
        </div>
      </Container>
    </>
  );
}

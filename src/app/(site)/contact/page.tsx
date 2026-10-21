import type { Metadata } from "next";
import { headers } from "next/headers";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
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
  // to be trusted (see middleware.ts).
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const { service } = await searchParams;
  const initialService = parseServiceParam(service);
  const settings = await loadContactFormSettings();
  const telHref = settings.direct_phone ? `tel:${settings.direct_phone.replace(/[^0-9+]/g, "")}` : "";

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

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start" aria-label="About your enquiry">
            <div className="rounded-2xl bg-brand-dark p-6 text-white sm:p-7">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">What happens next</h2>
              <ol className="mt-5 space-y-5">
                {settings.next_steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/70 text-xs font-semibold"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{step.title}</p>
                      {step.body && <p className="mt-1 text-sm text-white/75">{step.body}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark/70">
                Prefer to get in touch directly?
              </h2>
              <ul className="mt-4 space-y-2 text-sm font-medium text-brand-dark">
                <li>
                  <a href={`mailto:${settings.direct_email}`} className="underline underline-offset-2">
                    {settings.direct_email}
                  </a>
                </li>
                {telHref && (
                  <li>
                    <a href={telHref} className="underline underline-offset-2">
                      {settings.direct_phone}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

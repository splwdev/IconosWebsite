import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Container, Section } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact | Iconos Group",
  description: "Get in touch with Iconos Group about Managed Legal Services, Virtual DPO, or ad hoc legal work.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your business."
        intro="Tell us a little about what you're enquiring about, and we'll come back to you quickly."
      />
      <Section>
        <Container className="max-w-xl">
          <ContactForm />
          <p className="mt-8 text-sm text-neutral-500">
            Prefer email? Reach us directly at{" "}
            <a href="mailto:legal@iconos-group.com" className="font-medium text-brand-dark underline">
              legal@iconos-group.com
            </a>
          </p>
        </Container>
      </Section>
    </>
  );
}

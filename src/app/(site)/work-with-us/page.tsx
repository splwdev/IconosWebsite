import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Container, Section, PrimaryButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Work With Us | Iconos Group",
  description:
    "Iconos Group welcomes experienced, independent lawyers and like-minded solicitors to join the team, permanently or ad hoc.",
};

export default function WorkWithUsPage() {
  return (
    <>
      <PageHero
        eyebrow="Work with us"
        title="Join a team of independent, commercially minded lawyers."
        intro="We work with experienced, fully qualified independent lawyers and like-minded solicitors, either on a permanent or ad hoc basis."
      />
      <Section>
        <Container className="max-w-2xl space-y-5 text-[15px] leading-relaxed text-neutral-700">
          <p>
            If you&apos;re a commercially minded lawyer who believes legal
            advice should help close deals rather than slow them down,
            we&apos;d like to hear from you. Iconos Group works flexibly
            with consultant lawyers across corporate, commercial and data
            protection law.
          </p>
          <p>
            Tell us about your experience and the kind of work
            you&apos;re looking for, and we&apos;ll be in touch.
          </p>
        </Container>
      </Section>
      <Section tint>
        <Container className="text-center">
          <PrimaryButton href="/contact">Get in touch about opportunities</PrimaryButton>
        </Container>
      </Section>
    </>
  );
}

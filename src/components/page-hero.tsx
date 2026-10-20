import { Container, Eyebrow } from "./ui";

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    // Inset rounded band, per the approved inner-page mockups (Oct 2026).
    <div className="mx-2 mt-2 rounded-3xl bg-brand-cream py-14 sm:mx-4 sm:mt-4 md:py-16">
      <Container>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="max-w-3xl text-balance text-h1 font-semibold tracking-tight text-brand-dark">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl text-body text-brand-dark/75">
            {intro}
          </p>
        )}
      </Container>
    </div>
  );
}

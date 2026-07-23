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
    <div className="border-b border-black/5 bg-brand-cream py-16 md:py-20">
      <Container>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-brand-dark md:text-4xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600">
            {intro}
          </p>
        )}
      </Container>
    </div>
  );
}

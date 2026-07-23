import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, Eyebrow, PrimaryButton, SecondaryLink, CircleAccent } from "@/components/ui";
import { TestimonialCard } from "@/components/testimonial-card";
import { SERVICES } from "@/lib/content/services";
import { WORK_PROGRAMS } from "@/lib/content/how-we-work";
import { TESTIMONIALS } from "@/lib/content/testimonials";
import { getPublishedPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Iconos Group | Commercially Focused Legal Support",
  description:
    "Outsourced in-house counsel for growing UK and international businesses. Fixed monthly fee, embedded in your team.",
};

export default async function HomePage() {
  const managedServices = WORK_PROGRAMS.find((p) => p.slug === "subscription-model")!;
  const vdpo = WORK_PROGRAMS.find((p) => p.slug === "virtual-data-protection-officer")!;
  const recentPosts = await getPublishedPosts(3);

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden bg-brand-cream">
        <CircleAccent className="absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2" />
        <Container className="relative py-24 md:py-28">
          <div className="max-w-xl">
            <Eyebrow>Outsourced in-house counsel</Eyebrow>
            <h1 className="text-4xl font-semibold leading-[1.1] text-brand-dark md:text-5xl">
              Commercially focused legal support, embedded in your team.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-600">
              Business enablers, not blockers. We work alongside your sales
              team for a fixed monthly fee — adding money to your bottom
              line, not just sitting there as a cost centre.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <PrimaryButton href="/contact">Get in touch</PrimaryButton>
              <SecondaryLink href="/how-we-work">See how we work</SecondaryLink>
            </div>
          </div>
        </Container>
      </div>

      {/* About */}
      <Section>
        <Container className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="mx-auto aspect-square w-full max-w-sm rounded-full bg-brand-tint" />
          <div>
            <Eyebrow>Who we are</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight text-brand-dark">
              Founded to be part of your team — not outside it.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
              Iconos Group is an SRA-regulated commercial legal consultancy,
              led by Erika Moralez Perez, who combines years of legal
              practice with a decade of business management inside
              international IT and software companies.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
              We serve growing UK and international businesses of roughly
              10–150 people who&apos;ve outgrown DIY legal but aren&apos;t
              ready for a full-time hire — starting from as little as one
              hour a month.
            </p>
            <div className="mt-6">
              <SecondaryLink href="/who-we-are">Our story</SecondaryLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* Services */}
      <Section tint>
        <Container>
          <div className="mb-12 max-w-xl">
            <Eyebrow>What we do</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight text-brand-dark">
              Legal support across the areas that matter to growing businesses.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
              We only practise in corporate, commercial, and data protection
              law — so you always know exactly what you&apos;re getting.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/5 bg-black/5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <Link
                key={service.slug}
                href={`/what-we-do/${service.slug}`}
                className="bg-white p-8 transition-colors hover:bg-brand-cream"
              >
                <span className="mb-4 block text-xs font-bold text-brand-accent">
                  0{i + 1}
                </span>
                <h3 className="mb-2 font-semibold text-brand-dark">{service.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{service.summary}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* How we work */}
      <Section>
        <Container>
          <div className="mb-12 max-w-xl">
            <Eyebrow>How we work</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight text-brand-dark">
              One fixed monthly cost. No surprise invoices.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-brand-dark p-9 text-white">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-accent-soft">
                {managedServices.tag}
              </p>
              <h3 className="mb-3 text-xl font-semibold">{managedServices.title}</h3>
              <p className="mb-6 text-[15px] leading-relaxed text-white/80">
                {managedServices.summary}
              </p>
              <Link
                href={`/how-we-work/${managedServices.slug}`}
                className="border-b border-white/60 pb-0.5 text-sm font-semibold"
              >
                See the model →
              </Link>
            </div>
            <div className="rounded-2xl border border-black/10 p-9">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-accent">
                {vdpo.tag}
              </p>
              <h3 className="mb-3 text-xl font-semibold text-brand-dark">{vdpo.title}</h3>
              <p className="mb-6 text-[15px] leading-relaxed text-neutral-600">
                {vdpo.summary}
              </p>
              <Link
                href={`/how-we-work/${vdpo.slug}`}
                className="border-b border-brand-dark pb-0.5 text-sm font-semibold text-brand-dark"
              >
                Compare tiers →
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Founder */}
      <Section tint>
        <Container className="grid grid-cols-1 items-center gap-14 md:grid-cols-[0.85fr_1.15fr]">
          <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-brand-dark">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-dark">
              ▶
            </div>
          </div>
          <div>
            <Eyebrow>Meet the founder</Eyebrow>
            <blockquote className="mt-2 text-2xl font-medium leading-snug text-brand-dark">
              &ldquo;Legal advice should add to your bottom line — not just
              sit there as a cost centre.&rdquo;
            </blockquote>
            <p className="mt-5 text-sm font-semibold text-brand-dark">
              Erika Moralez Perez
            </p>
            <p className="text-sm text-neutral-500">Founder, Iconos Group</p>
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section>
        <Container>
          <div className="mb-10 max-w-xl">
            <Eyebrow>Clients</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight text-brand-dark">
              What our clients say
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.attribution} {...t} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Blog teaser */}
      <Section tint>
        <Container>
          <div className="mb-10 max-w-xl">
            <Eyebrow>From the blog</Eyebrow>
            <h2 className="text-3xl font-semibold leading-tight text-brand-dark">
              Weekly, practical, commercially minded.
            </h2>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-neutral-500">New posts are on the way.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white"
                >
                  <div
                    className="h-36 bg-brand-tint bg-cover bg-center"
                    style={
                      post.featured_image_url
                        ? { backgroundImage: `url(${post.featured_image_url})` }
                        : undefined
                    }
                  />
                  <div className="p-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-accent">
                      {post.category}
                    </p>
                    <h3 className="mb-2 font-semibold leading-snug text-brand-dark">
                      {post.title}
                    </h3>
                    <p className="text-sm text-neutral-500">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* Contact CTA */}
      <Section>
        <Container>
          <div className="rounded-3xl bg-brand-dark px-8 py-16 text-center text-white md:px-20">
            <h2 className="text-3xl font-semibold">Ready to talk?</h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
              Tell us a little about your business and what you&apos;re
              enquiring about — we&apos;ll come back to you quickly.
            </p>
            <div className="mt-8">
              <PrimaryButton href="/contact" variant="light">Get in touch</PrimaryButton>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

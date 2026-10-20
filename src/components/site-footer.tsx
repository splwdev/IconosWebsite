import Link from "next/link";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";
import { SraBadge } from "./sra-badge";
import { LEGAL_LINKS } from "@/lib/content/nav";
import { REGULATORY_STATEMENT } from "@/lib/content/legal-pages";
import { Container } from "./ui";
 
export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 py-14">
      <Container>
        {/* Brand — centered banner above the three columns */}
        <div className="mb-10 flex justify-center">
          <Image
            src="/logo.png"
            alt="Iconos Group"
            width={576}
            height={410}
            sizes="112px"
            className="h-20 w-auto"
          />
        </div>
 
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Tagline + LinkedIn */}
          <div className="text-center">
            <h2 className="text-sm font-semibold text-brand-dark">Iconos Group</h2>
            <p className="mt-3 text-sm text-brand-dark/75">
              Commercially focused legal support, <br />embedded in your team.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <a
                href="https://www.linkedin.com/company/iconos-group/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark text-white transition-colors hover:bg-brand-darker"
              >
                <Linkedin aria-hidden className="h-4 w-4" />
                <span className="sr-only">Iconos Group on LinkedIn (opens in a new tab)</span>
              </a>
              <a
                href="mailto:legal@iconos-group.com"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark text-white transition-colors hover:bg-brand-darker"
              >
                <Mail aria-hidden className="h-4 w-4" />
                <span className="sr-only">Email legal@iconos-group.com</span>
              </a>
            </div>
          </div>
 
          {/* Contact — centered so it lines up directly under the logo above */}
          <div className="text-center">
            <h2 className="text-sm font-semibold text-brand-dark">Get in touch</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-brand-dark/75">
              25 Norwich Way
              <br />
              Croxley Green, WD3 3SP
            </address>
            <a
              href="mailto:legal@iconos-group.com"
              className="mt-3 block text-sm text-brand-dark/75 underline hover:text-brand-dark"
            >
              legal@iconos-group.com
            </a>
          </div>
 
          {/* Work With Us */}
          <div className="text-center">
            <h2 className="text-sm font-semibold text-brand-dark">Work with us</h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-dark/75">
              Consultant lawyers and referrers — <br />we&apos;d love to hear from you.
            </p>
            <Link
              href="/work-with-us"
              className="mt-4 inline-block text-sm font-medium text-brand-dark underline"
            >
              Find out more ↗
            </Link>
          </div>
        </div>
 
        {/* Q17: SRA regulation should remain on the site, but far less
            prominently than the previous design — hence small, quiet text
            here rather than a banner. */}
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
          <p className="max-w-2xl text-xs leading-relaxed text-brand-dark/75">{REGULATORY_STATEMENT}</p>
          <SraBadge />
        </div>
 
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-6 text-xs text-brand-dark/75">
          <span>© {new Date().getFullYear()} Iconos Group</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand-dark">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
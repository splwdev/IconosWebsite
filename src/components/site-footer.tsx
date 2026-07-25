import Link from "next/link";
import Image from "next/image";
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
            width={192}
            height={142}
            className="h-20 w-auto"
          />
        </div>
 
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Tagline + LinkedIn */}
          <div className="text-center">
            <h2 className="text-sm font-semibold text-brand-dark">Iconos Group</h2>
            <p className="mt-3 text-sm text-neutral-500">
              Commercially focused legal support, <br />embedded in your team.
            </p>
            <a
              href="https://www.linkedin.com/company/iconos-group/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-brand-dark underline"
            >
              LinkedIn ↗
            </a>
          </div>
 
          {/* Contact — centered so it lines up directly under the logo above */}
          <div className="text-center">
            <h2 className="text-sm font-semibold text-brand-dark">Get in touch</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-neutral-500">
              25 Norwich Way
              <br />
              Croxley Green, WD3 3SP
            </address>
            <a
              href="mailto:legal@iconos-group.com"
              className="mt-3 block text-sm text-neutral-500 underline hover:text-brand-dark"
            >
              legal@iconos-group.com
            </a>
          </div>
 
          {/* Work With Us */}
          <div className="text-center">
            <h2 className="text-sm font-semibold text-brand-dark">Work with us</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
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
        <p className="max-w-2xl text-xs leading-relaxed text-neutral-400">
          {REGULATORY_STATEMENT}
        </p>
 
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-6 text-xs text-neutral-400">
          <span>© {new Date().getFullYear()} Iconos Group</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-neutral-700">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
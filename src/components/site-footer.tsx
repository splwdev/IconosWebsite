import Link from "next/link";
import { PRIMARY_NAV, LEGAL_LINKS, isNavGroup } from "@/lib/content/nav";
import { REGULATORY_STATEMENT } from "@/lib/content/legal-pages";
import { Container } from "./ui";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 py-14">
      <Container>
        <div className="mb-10 flex flex-wrap justify-between gap-10">
          <div className="max-w-xs">
            <span className="block text-lg font-semibold tracking-[0.16em] text-brand-dark">
              ICONOS
            </span>
            <p className="mt-2 text-sm text-neutral-500">
              Commercially focused legal support, embedded in your team.
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

          <nav className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-neutral-600">
            {PRIMARY_NAV.map((item) => (
              <Link key={isNavGroup(item) ? item.href : item.href} href={item.href} className="hover:text-brand-dark">
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="hover:text-brand-dark">
              Contact
            </Link>
          </nav>
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

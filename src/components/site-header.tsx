"use client";
 
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavLink, NavGroup } from "@/lib/content/nav";
import { isNavGroup } from "@/lib/content/nav";
import { NavDropdown } from "./nav-dropdown";
import { Container } from "./ui";
 
export function SiteHeader({ nav }: { nav: Array<NavLink | NavGroup> }) {
  const [mobileOpen, setMobileOpen] = useState(false);
 
  return (
    <header className="relative z-40 border-b border-black/5 bg-white">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Iconos Group — Your legal team, tailored"
            width={192}
            height={142}
            priority
            className="h-20 w-auto"
          />
        </Link>
 
        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {nav.map((item) =>
            isNavGroup(item) ? (
              <NavDropdown key={item.label} item={item} />
            ) : (
              <Link key={item.href} href={item.href} className="py-2 hover:text-brand-accent">
                {item.label}
              </Link>
            )
          )}
        </nav>
 
        <Link
          href="/contact"
          className="hidden rounded-brand bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white md:inline-block"
        >
          Contact us
        </Link>
 
        <button
          type="button"
          className="md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>
 
      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-black/5 bg-white px-6 py-4 md:hidden">
          {nav.map((item) =>
            isNavGroup(item) ? (
              <div key={item.label} className="py-2">
                <Link
                  href={item.href}
                  className="block py-1.5 text-sm font-semibold text-brand-dark"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block py-1.5 pl-3 text-sm text-neutral-600"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-sm font-semibold text-brand-dark"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
          <Link
            href="/contact"
            className="mt-3 block rounded-brand bg-brand-dark px-6 py-2.5 text-center text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            Contact us
          </Link>
        </nav>
      )}
    </header>
  );
}
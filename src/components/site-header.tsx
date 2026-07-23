"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { PRIMARY_NAV, isNavGroup } from "@/lib/content/nav";
import { Container } from "./ui";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-40 border-b border-black/5 bg-white">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Iconos Group — Your legal team, tailored"
            width={416}
            height={185}
            priority
            className="h-20 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {PRIMARY_NAV.map((item) =>
            isNavGroup(item) ? (
              <details key={item.label} className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-1 py-2 marker:content-none hover:text-brand-accent">
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                </summary>
                <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-black/5 bg-white p-2 shadow-lg">
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-cream"
                  >
                    Overview
                  </Link>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-brand-cream hover:text-brand-dark"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </details>
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
          {PRIMARY_NAV.map((item) =>
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

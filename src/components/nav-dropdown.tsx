"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { NavGroup } from "@/lib/content/nav";

const CLOSE_DELAY_MS = 150;

export function NavDropdown({ item }: { item: NavGroup }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);

  // Detect once, client-side only, whether this is a real hover+precise-pointer
  // device. Touch devices are left entirely alone — they keep native
  // tap-to-open <summary> behaviour with no mouse handlers attached.
  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    setHoverCapable(mql.matches);
    const listener = (e: MediaQueryListEvent) => setHoverCapable(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  // Close on outside click/tap (native <details> doesn't do this by itself).
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (!detailsRef.current) return;
      if (!detailsRef.current.contains(e.target as Node)) {
        detailsRef.current.open = false;
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function handleMouseEnter() {
    if (!hoverCapable) return;
    clearCloseTimer();
    if (detailsRef.current && !detailsRef.current.open) {
      detailsRef.current.open = true;
      setIsOpen(true);
    }
  }

  function handleMouseLeave() {
    if (!hoverCapable) return;
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      if (detailsRef.current) {
        detailsRef.current.open = false;
        setIsOpen(false);
      }
    }, CLOSE_DELAY_MS);
  }

  // Keep React state in sync with native toggling (click, Enter/Space on
  // the summary, or our own imperative ref.current.open assignments above).
  function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    setIsOpen(e.currentTarget.open);
  }

  return (
    <details
      ref={detailsRef}
      className="group relative"
      onToggle={handleToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <summary
        className="flex cursor-pointer list-none items-center gap-1 py-2 marker:content-none hover:text-brand-accent"
        aria-expanded={isOpen}
      >
        {item.label}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </summary>
      <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-black/5 bg-white p-2 shadow-lg">
        {item.showOverview !== false && (
          <Link
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-cream"
            onClick={() => setIsOpen(false)}
          >
            Overview
          </Link>
        )}
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-brand-cream hover:text-brand-dark"
            onClick={() => setIsOpen(false)}
          >
            {child.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
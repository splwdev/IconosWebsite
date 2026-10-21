"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
  badge?: number;
}

/** Section menu shown on every admin page. Admin-only sections are hidden from other staff. */
export function AdminNav({ isAdmin, unreadEnquiries }: { isAdmin: boolean; unreadEnquiries: number }) {
  const pathname = usePathname();
  const items: AdminNavItem[] = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/contact-submissions", label: "Enquiries", badge: unreadEnquiries },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/posts", label: "Blog posts" },
    { href: "/admin/testimonials", label: "Testimonials" },
    { href: "/admin/themes", label: "Themes" },
    { href: "/admin/settings", label: "Settings", adminOnly: true },
    { href: "/admin/staff", label: "Staff", adminOnly: true },
  ];

  return (
    <nav aria-label="Admin sections" className="border-b border-neutral-200 bg-white">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6 text-sm">
        {items
          .filter((item) => isAdmin || !item.adminOnly)
          .map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 font-medium transition-colors ${
                    active
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {item.label}
                  {item.badge ? (
                    <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-white">
                      {item.badge}
                      <span className="sr-only"> unread</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}

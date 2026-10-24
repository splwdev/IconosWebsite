import Link from "next/link";

/** Shown to signed-in staff browsing the public site while maintenance mode is on. */
export function MaintenanceBanner() {
  return (
    <div
      role="status"
      className="sticky top-0 z-[998] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-neutral-900"
    >
      <span>Maintenance mode is on. Visitors see the maintenance page; you&apos;re seeing the site because you&apos;re signed in.</span>
      <Link href="/admin/settings" className="underline underline-offset-2">
        Switch off in Settings
      </Link>
    </div>
  );
}

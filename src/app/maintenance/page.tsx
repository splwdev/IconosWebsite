import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { loadMaintenance } from "@/lib/settings/load-maintenance";
import { loadContactFormSettings } from "@/lib/settings/load-contact-form";
import { getStaffContext } from "@/lib/admin/staff-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "We'll be back soon | Iconos Group",
  robots: { index: false, follow: false },
};

/**
 * Shown for every public address while maintenance mode is on (the
 * middleware rewrites to here with a 503). Deliberately standalone — no
 * site menu or footer, since those links would only lead back here.
 */
export default async function MaintenancePage() {
  const [maintenance, contact] = await Promise.all([loadMaintenance(), loadContactFormSettings()]);

  // Visited directly while the site is up: send visitors home. Staff may
  // look at it any time, to check the wording before switching it on.
  if (!maintenance.enabled && !(await getStaffContext())) redirect("/");

  const telHref = contact.direct_phone ? `tel:${contact.direct_phone.replace(/[^0-9+]/g, "")}` : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl bg-white px-6 py-12 text-center shadow-sm sm:px-12">
        <Image
          src="/logo.png"
          alt="Iconos Group — Your legal team, tailored"
          width={576}
          height={410}
          priority
          className="mx-auto h-24 w-auto sm:h-28"
        />
        <h1 className="mt-8 text-h2 font-semibold text-brand-dark">{maintenance.heading}</h1>
        <p className="mt-4 whitespace-pre-line text-body text-brand-dark/75">{maintenance.message}</p>
        <div className="mt-8 border-t border-black/5 pt-6 text-sm text-brand-dark">
          <p className="font-semibold">Get in touch</p>
          <p className="mt-2 space-x-4">
            <a href={`mailto:${contact.direct_email}`} className="underline underline-offset-2">
              {contact.direct_email}
            </a>
            {telHref && (
              <a href={telHref} className="underline underline-offset-2">
                {contact.direct_phone}
              </a>
            )}
          </p>
        </div>
        {!maintenance.enabled && (
          <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Preview for staff: maintenance mode is off, so visitors can&apos;t see this page.
          </p>
        )}
      </div>
    </main>
  );
}

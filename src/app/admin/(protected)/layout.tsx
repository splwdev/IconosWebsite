import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { getPublicNavGroups } from "@/lib/content/public-nav";
import { buildPrimaryNav } from "@/lib/content/nav";
import { signOut } from "../actions";
import { getStaffContext } from "@/lib/admin/staff-context";
import { AdminNav } from "@/components/admin/admin-nav";
 
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  // Defense in depth — mirrors updateSession() in middleware.ts exactly.
  // Deliberately NOT relying on middleware alone to gate this: Next.js's
  // own guidance is that middleware should not be the only line of
  // defense, and it's been directly confirmed on this deployment target
  // that middleware can silently fail to execute at all while every
  // Server Component still runs correctly — this layout is that backstop,
  // redundant with middleware, not instead of it.
  if (!user) {
    redirect("/admin/login");
  }
 
  const staff = await getStaffContext();
  if (!staff) {
    redirect("/admin/login?error=not_authorized");
  }

  const [{ whatWeDo, howWeWork, customLinks }, { count: unreadEnquiries }] = await Promise.all([
    getPublicNavGroups(),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).is("read_at", null),
  ]);
  const nav = buildPrimaryNav(whatWeDo, howWeWork, customLinks);
 
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Real public site header — deliberate choice: staff can jump straight
          to any live page from inside admin. Most nav items aren't editable
          yet (only Posts/Themes/Pages have real editors so far), so this is
          "quick look at the live page", not "edit this section". */}
      <SiteHeader nav={nav} />
 
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-900 px-6 py-2.5 text-sm text-neutral-300">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Admin dashboard
        </Link>
        <div className="flex items-center gap-4">
          <span>
            Signed in as <span className="font-medium text-white">{user?.email}</span>
          </span>
          <form action={signOut}>
            <button type="submit" className="text-neutral-300 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </div>
 
      <AdminNav isAdmin={staff.role === "admin"} unreadEnquiries={unreadEnquiries ?? 0} />

      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
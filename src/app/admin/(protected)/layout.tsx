import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { signOut } from "../actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Real public site header — deliberate choice: staff can jump straight
          to any live page from inside admin. Most nav items aren't editable
          yet (only Posts/Themes have real editors so far), so this is
          "quick look at the live page", not "edit this section". */}
      <SiteHeader />

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

      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
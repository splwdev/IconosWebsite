import {
  LayoutDashboard,
  FileText,
  Palette,
  MessageSquareQuote,
  Mail,
  Users,
  Briefcase,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminSectionBadge } from "@/components/admin/section-badge";
import { AdminCard } from "@/components/admin/admin-card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: draftCount }, { count: publishedCount }, { data: liveTheme }] =
    await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("themes").select("name").eq("status", "published").maybeSingle(),
    ]);

  return (
    <div>
      <AdminSectionBadge icon={LayoutDashboard} label="Content Admin" />
      <h1 className="mb-2 mt-3 text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mb-10 text-sm text-neutral-500">
        Manage the Iconos Group website — blog posts, brand theme, and the
        sections below as they come online.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AdminCard
          icon={FileText}
          title="Posts"
          description="Write, edit and publish blog posts."
          href="/admin/posts"
          stat={`${draftCount ?? 0} draft${draftCount === 1 ? "" : "s"} · ${publishedCount ?? 0} published`}
        />
        <AdminCard
          icon={Palette}
          title="Themes"
          description="Preview and publish the site's brand theme."
          href="/admin/themes"
          stat={liveTheme ? `Live: ${liveTheme.name}` : "No theme published yet"}
        />
        <AdminCard
          icon={Briefcase}
          title="Services & How We Work"
          description="Edit practice area pages and the subscription/VDPO/ad hoc programs."
        />
        <AdminCard
          icon={MessageSquareQuote}
          title="Testimonials"
          description="Manage client quotes shown on the homepage and Clients page."
        />
        <AdminCard
          icon={Mail}
          title="Contact submissions"
          description="Review enquiries received through the contact form."
        />
        <AdminCard
          icon={Users}
          title="Staff access"
          description="Manage who can sign in to this admin area."
        />
      </div>
    </div>
  );
}
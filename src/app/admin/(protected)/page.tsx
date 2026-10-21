import {
  LayoutDashboard,
  FileText,
  Palette,
  MessageSquareQuote,
  Mail,
  Users,
  Briefcase,
  Settings,
} from "lucide-react";
import { getStaffContext } from "@/lib/admin/staff-context";
import { createClient } from "@/lib/supabase/server";
import { AdminSectionBadge } from "@/components/admin/section-badge";
import { AdminCard } from "@/components/admin/admin-card";
 
export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const staff = await getStaffContext();
  const isAdmin = staff?.role === "admin";
 
  const [
    { count: draftCount },
    { count: publishedCount },
    { data: liveTheme },
    { count: pageDraftCount },
    { count: pagePublishedCount },
    { count: staffCount },
    { count: testimonialDraftCount },
    { count: testimonialPublishedCount },
    { count: unreadSubmissionCount },
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("themes").select("name").eq("status", "published").maybeSingle(),
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .from("pages")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("staff_users").select("*", { count: "exact", head: true }),
    supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).is("read_at", null),
  ]);
 
  return (
    <div>
      <AdminSectionBadge icon={LayoutDashboard} label="Content Admin" />
      <h1 className="mb-2 mt-3 text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mb-10 text-sm text-neutral-500">
        Manage the Iconos Group website: enquiries, pages, blog posts, testimonials and the
        brand theme.
      </p>
 
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AdminCard
          icon={Mail}
          title="Enquiries"
          description="Client and Work With Us enquiries from the website forms."
          href="/admin/contact-submissions"
          stat={
            unreadSubmissionCount && unreadSubmissionCount > 0
              ? `${unreadSubmissionCount} unread`
              : "All caught up"
          }
        />
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
          title="Pages"
          description="Edit practice area pages, How We Work programs, and custom pages."
          href="/admin/pages"
          stat={`${pageDraftCount ?? 0} draft${pageDraftCount === 1 ? "" : "s"} · ${pagePublishedCount ?? 0} published`}
        />
        <AdminCard
          icon={MessageSquareQuote}
          title="Testimonials"
          description="Manage client quotes shown on the homepage and Clients page."
          href="/admin/testimonials"
          stat={`${testimonialDraftCount ?? 0} draft${testimonialDraftCount === 1 ? "" : "s"} · ${testimonialPublishedCount ?? 0} published`}
        />
        {isAdmin && (
          <AdminCard
            icon={Settings}
            title="Settings"
            description="Where enquiries are emailed, confirmation emails, and the text around both forms."
            href="/admin/settings"
            stat="Contact and Work With Us forms"
          />
        )}
        {isAdmin && (
          <AdminCard
            icon={Users}
            title="Staff access"
            description="Manage who can sign in to this admin area."
            href="/admin/staff"
            stat={`${staffCount ?? 0} staff member${staffCount === 1 ? "" : "s"}`}
          />
        )}
      </div>
    </div>
  );
}
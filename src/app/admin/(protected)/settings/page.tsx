import { getContactFormSettings, getFormsStatus } from "./actions";
import { ContactFormSettingsCard } from "@/components/admin/contact-form-settings-card";
import { FormsStatusCard } from "@/components/admin/forms-status-card";
import { DEFAULT_CONTACT_FORM_SETTINGS } from "@/lib/settings/contact-form";
import { getStaffContext } from "@/lib/admin/staff-context";
import { BlogSwitchCard } from "@/components/admin/blog-switch-card";
import { isBlogEnabled } from "@/lib/settings/blog";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const staff = await getStaffContext();

  // Settings are admin-only (RLS: is_staff_admin()). Say so, rather than
  // showing a form of defaults that can't be saved.
  if (staff?.role !== "admin") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-600">
          Settings can only be changed by an admin. Ask an admin to change your access in Staff if you need to
          edit where enquiries are sent or the text around the forms.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const [loaded, status, blogEnabled, { count: publishedPosts }] = await Promise.all([
    getContactFormSettings(),
    getFormsStatus(),
    isBlogEnabled(),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Business configuration you can change without a developer. API credentials and third-party
          integrations are managed separately by your development team.
        </p>
      </div>

      <BlogSwitchCard initialEnabled={blogEnabled} publishedCount={publishedPosts ?? 0} />

      <FormsStatusCard status={status} />

      {!loaded && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The saved settings couldn&apos;t be loaded, so the defaults are shown. Saving will store them.
        </p>
      )}

      <ContactFormSettingsCard
        initialSettings={loaded?.settings ?? DEFAULT_CONTACT_FORM_SETTINGS}
        lastUpdatedAt={loaded?.updatedAt ?? null}
      />
    </div>
  );
}

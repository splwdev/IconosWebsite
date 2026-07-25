import { getContactFormSettings } from "./actions"
import { ContactFormSettingsCard } from "@/components/admin/contact-form-settings-card";
import { DEFAULT_CONTACT_FORM_SETTINGS } from "@/lib/settings/contact-form";
 
export default async function AdminSettingsPage() {
  const loaded = await getContactFormSettings();
 
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-dark">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Business configuration you can change without a developer. API credentials and
          third-party integrations are managed separately by your development team.
        </p>
      </div>
 
      <ContactFormSettingsCard
        initialSettings={loaded?.settings ?? DEFAULT_CONTACT_FORM_SETTINGS}
        lastUpdatedAt={loaded?.updatedAt ?? null}
      />
    </div>
  );
}
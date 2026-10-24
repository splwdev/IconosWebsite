import { headers } from "next/headers";
import { isBlogEnabled } from "@/lib/settings/blog";
import { MaintenanceBanner } from "@/components/maintenance-banner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublicNavGroups } from "@/lib/content/public-nav";
import { buildPrimaryNav } from "@/lib/content/nav";
 
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { whatWeDo, howWeWork, customLinks } = await getPublicNavGroups();
  const nav = buildPrimaryNav(whatWeDo, howWeWork, customLinks, await isBlogEnabled());
 
  // Set by the middleware only for signed-in staff while maintenance is on.
  const maintenancePreview = (await headers()).get("x-maintenance-preview") === "1";

  return (
    <>
      {maintenancePreview && <MaintenanceBanner />}
      <SiteHeader nav={nav} />
      {children}
      <SiteFooter />
    </>
  );
}
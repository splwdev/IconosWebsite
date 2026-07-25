import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublicNavGroups } from "@/lib/content/public-nav";
import { buildPrimaryNav } from "@/lib/content/nav";
 
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { whatWeDo, howWeWork, customLinks } = await getPublicNavGroups();
  const nav = buildPrimaryNav(whatWeDo, howWeWork, customLinks);
 
  return (
    <>
      <SiteHeader nav={nav} />
      {children}
      <SiteFooter />
    </>
  );
}
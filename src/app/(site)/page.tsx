import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPageSections } from "@/lib/content/get-page-sections";
import { PageSectionsRenderer } from "@/components/page-sections-renderer";
import { Container } from "@/components/ui";
import type { Page } from "@/lib/content/pages";
 
export const metadata: Metadata = {
  title: "Iconos Group | Commercially Focused Legal Support",
  description:
    "Outsourced in-house counsel for growing UK and international businesses. Fixed monthly fee, embedded in your team.",
};
 
async function getHomePage(): Promise<Page | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("page_type", "home")
    .eq("status", "published")
    .maybeSingle();
  return data as Page | null;
}
 
export default async function HomePage() {
  const home = await getHomePage();
 
  // Should never happen in practice (the home row is a protected
  // singleton, seeded via migration, and the admin UI doesn't allow it to
  // be unpublished or deleted) — but fail gracefully rather than crashing
  // the entire site if it somehow does.
  if (!home) {
    return (
      <Container className="py-24 text-center text-neutral-500">
        <p>Homepage content is not available right now.</p>
      </Container>
    );
  }
 
  const sections = await getPageSections(home.id);
 
  return (
    <Container className="pb-8 pt-6 sm:pt-10">
      <PageSectionsRenderer sections={sections} />
    </Container>
  );
}
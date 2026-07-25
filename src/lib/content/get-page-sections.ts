import { createClient } from "@/lib/supabase/server";
import { pageSectionSchema, type PageSection } from "./page-sections";
 
export async function getPageSections(pageId: string): Promise<PageSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select("section_type, background, content")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
 
  if (error) {
    console.error("[page-sections] Failed to load sections:", error.message);
    return [];
  }
 
  const sections: PageSection[] = [];
  for (const row of data ?? []) {
    const parsed = pageSectionSchema.safeParse(row);
    if (parsed.success) {
      sections.push(parsed.data);
    } else {
      console.error("[page-sections] Skipping malformed section row:", parsed.error.issues);
    }
  }
  return sections;
}
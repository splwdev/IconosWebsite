import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { OverviewSlug, Page } from "./pages";

/**
 * The published overview page (/how-we-work, /what-we-do, /who-we-are, /clients, /work-with-us),
 * or null if it hasn't been created yet. Wrapped in React cache() because
 * generateMetadata and the page component both call it in one request.
 */
export const getOverviewPage = cache(async (slug: OverviewSlug): Promise<Page | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("page_type", "overview")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error(`[overview] Failed to load /${slug}:`, error.message);
    return null;
  }
  return data as Page | null;
});

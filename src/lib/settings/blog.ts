import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Whether the Blog is switched on (admin → Settings). When off, it's left
 * out of the menu, the homepage and the sitemap, and its pages 404 for the
 * public. Errors (e.g. before migration 0033) count as off, so the Blog
 * never appears by accident.
 */
export const isBlogEnabled = cache(async (): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_blog_enabled");
    if (error) {
      console.error("[blog] get_blog_enabled failed:", error.message);
      return false;
    }
    return data === true;
  } catch (err) {
    console.error("[blog] Unexpected error reading the blog switch:", err);
    return false;
  }
});

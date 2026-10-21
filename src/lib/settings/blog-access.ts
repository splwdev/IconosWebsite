import { getStaffContext } from "@/lib/admin/staff-context";
import { isBlogEnabled } from "./blog";

/**
 * Whether this visitor may see Blog pages: everyone while the Blog is
 * switched on; only signed-in staff (to preview) while it's off.
 */
export async function canViewBlog(): Promise<boolean> {
  if (await isBlogEnabled()) return true;
  return (await getStaffContext()) !== null;
}

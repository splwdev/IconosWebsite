import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "staff";

export interface StaffContext {
  userId: string;
  email: string;
  role: StaffRole;
}

/**
 * The signed-in staff member, or null if not signed in / not staff. Cached
 * per request so the layout and pages share one lookup.
 *
 * The role only decides what the admin UI shows. What anyone can actually
 * read or change is enforced by RLS (is_staff() / is_staff_admin()).
 */
export const getStaffContext = cache(async (): Promise<StaffContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("staff_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!data) return null;

  return { userId: user.id, email: user.email ?? "", role: data.role === "admin" ? "admin" : "staff" };
});

"use server";
 
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
 
export type StaffRole = "staff" | "admin";
 
export interface StaffMember {
  user_id: string;
  email: string;
  role: StaffRole;
  created_at: string;
}
 
export async function getStaffList(): Promise<StaffMember[]> {
  const supabase = await createClient();
  // RLS ("admins manage staff list", is_staff_admin()) is what actually
  // gates this — a non-admin session just gets an empty array back.
  const { data } = await supabase
    .from("staff_users")
    .select("user_id, email, role, created_at")
    .order("created_at", { ascending: true });
  return (data as StaffMember[] | null) ?? [];
}
 
export interface StaffActionResult {
  ok: boolean;
  error?: string;
}
 
/**
 * Adds a staff member by email. The person must have already attempted to
 * sign in at least once via Microsoft SSO — even though they'd have been
 * rejected as "not authorized" at that point — since that's what creates
 * their auth.users record, which staff_users.user_id must reference.
 */
export async function addStaffMember(email: string, role: StaffRole): Promise<StaffActionResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { ok: false, error: "Enter an email address." };
  }
 
  const supabase = await createClient();
 
  const { data: userId, error: rpcError } = await supabase.rpc("get_user_id_by_email", {
    p_email: trimmedEmail,
  });
 
  if (rpcError) {
    return {
      ok: false,
      error: rpcError.message.includes("Not authorized")
        ? "Only admins can manage staff access."
        : rpcError.message,
    };
  }
 
  if (!userId) {
    return {
      ok: false,
      error:
        "This person hasn't signed in yet. Ask them to try signing in at /admin/login first (they'll see \"not authorized\" — that's expected), then add them here.",
    };
  }
 
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();
 
  const { error } = await supabase.from("staff_users").insert({
    user_id: userId,
    email: trimmedEmail,
    role,
    added_by: caller?.id ?? null,
  });
 
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "This person is already on the staff list." };
    }
    return { ok: false, error: error.message };
  }
 
  revalidatePath("/admin/staff");
  return { ok: true };
}
 
export async function updateStaffRole(userId: string, role: StaffRole): Promise<StaffActionResult> {
  const supabase = await createClient();
 
  // Demoting the last admin would lock everyone (including future admins)
  // out of staff management entirely — RLS wouldn't stop this on its own,
  // since is_staff_admin() only checks the caller, not the effect of the
  // change.
  if (role === "staff") {
    const { data: target } = await supabase
      .from("staff_users")
      .select("role")
      .eq("user_id", userId)
      .single();
 
    if (target?.role === "admin") {
      const { count } = await supabase
        .from("staff_users")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        return { ok: false, error: "Can't demote the last admin." };
      }
    }
  }
 
  const { error } = await supabase.from("staff_users").update({ role }).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
 
  revalidatePath("/admin/staff");
  return { ok: true };
}
 
export async function removeStaffMember(userId: string): Promise<StaffActionResult> {
  const supabase = await createClient();
 
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();
 
  if (caller?.id === userId) {
    return { ok: false, error: "You can't remove your own access." };
  }
 
  const { data: target } = await supabase
    .from("staff_users")
    .select("role")
    .eq("user_id", userId)
    .single();
 
  if (target?.role === "admin") {
    const { count } = await supabase
      .from("staff_users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "Can't remove the last admin." };
    }
  }
 
  const { error } = await supabase.from("staff_users").delete().eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
 
  revalidatePath("/admin/staff");
  return { ok: true };
}
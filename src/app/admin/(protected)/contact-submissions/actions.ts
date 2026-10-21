"use server";
 
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaffContext } from "@/lib/admin/staff-context";
import { RETENTION_MONTH_OPTIONS } from "@/lib/admin/enquiries";
 
export async function markSubmissionRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Failed to mark as read: ${error.message}`);
  revalidatePath("/admin/contact-submissions");
}
 
export async function markSubmissionUnread(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ read_at: null })
    .eq("id", id);
  if (error) throw new Error(`Failed to mark as unread: ${error.message}`);
  revalidatePath("/admin/contact-submissions");
}
 
export async function deleteSubmission(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete: ${error.message}`);
  revalidatePath("/admin/contact-submissions");
}
export interface DeleteOlderResult {
  ok: boolean;
  message: string;
}

/**
 * Deletes every enquiry received more than `months` ago — the tool for an
 * agreed retention period. Admins only; RLS also limits deletes to staff.
 */
export async function deleteSubmissionsOlderThan(months: number): Promise<DeleteOlderResult> {
  const staff = await getStaffContext();
  if (staff?.role !== "admin") return { ok: false, message: "Only admins can delete enquiries in bulk." };
  if (!(RETENTION_MONTH_OPTIONS as readonly number[]).includes(months)) {
    return { ok: false, message: "Choose one of the listed periods." };
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_submissions")
    .delete()
    .lt("created_at", cutoff.toISOString())
    .select("id");
  if (error) return { ok: false, message: `Couldn't delete: ${error.message}` };

  revalidatePath("/admin/contact-submissions");
  revalidatePath("/admin");
  const n = data?.length ?? 0;
  return {
    ok: true,
    message:
      n === 0
        ? `No enquiries older than ${months} months.`
        : `Deleted ${n} enquir${n === 1 ? "y" : "ies"} received before ${cutoff.toLocaleDateString("en-GB")}.`,
  };
}

"use server";
 
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
 
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
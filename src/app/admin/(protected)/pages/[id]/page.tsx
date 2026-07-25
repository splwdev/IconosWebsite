import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/content/pages";
import { PageEditorForm } from "@/components/admin/page-editor-form";
 
export default async function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  // RLS ("staff reads all pages") is what allows a draft to load here.
  const { data: page } = await supabase.from("pages").select("*").eq("id", id).single();
 
  if (!page) notFound();
 
  return <PageEditorForm page={page as Page} />;
}
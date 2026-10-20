import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Page } from "@/lib/content/pages";
import { getPageSections } from "@/lib/content/get-page-sections";
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
 
  const [sections, { data: testimonials }] = await Promise.all([
    getPageSections(id),
    // For the Testimonial Spotlight picker (RLS lets staff see drafts too).
    supabase.from("testimonials").select("id, attribution, role, status").order("sort_order", { ascending: true }),
  ]);

  const testimonialOptions = (testimonials ?? []).map((t) => ({
    id: t.id as string,
    label: [t.attribution, t.role].filter(Boolean).join(" — "),
    published: t.status === "published",
  }));

  return <PageEditorForm page={page as Page} initialSections={sections} testimonialOptions={testimonialOptions} />;
}
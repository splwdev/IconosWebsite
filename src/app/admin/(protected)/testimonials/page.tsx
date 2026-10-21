import { createClient } from "@/lib/supabase/server";
import type { TestimonialRow as TestimonialRowType } from "@/lib/content/testimonials-schema";
import { createBlankTestimonial } from "./actions";
import { TestimonialRow } from "@/components/admin/testimonial-row";
 
export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  // RLS ("staff reads all testimonials") is what allows drafts to show here.
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
 
  const rows = (testimonials as TestimonialRowType[] | null) ?? [];
 
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Testimonials</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Every published testimonial shows on the Clients page; tick “Show on homepage” for the homepage highlights. Edit directly below.
          </p>
        </div>
        <form action={createBlankTestimonial}>
          <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
            + New testimonial
          </button>
        </form>
      </div>
 
      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {rows.length === 0 && <p className="p-6 text-sm text-neutral-500">No testimonials yet.</p>}
        {rows.map((t) => (
          <TestimonialRow key={t.id} testimonial={t} />
        ))}
      </div>
    </div>
  );
}
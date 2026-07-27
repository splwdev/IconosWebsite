import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ContactSubmission, EnquiryType } from "@/lib/content/contact-submissions";
import { SubmissionRow } from "../../../../components/admin/submission-row";
 
const ENQUIRY_TYPES: EnquiryType[] = [
  "Managed Legal Services",
  "Virtual Data Protection Officer",
  "Ad Hoc Work",
  "General Enquiry",
];
 
export default async function AdminContactSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; unread?: string }>;
}) {
  const { type, unread } = await searchParams;
 
  const supabase = await createClient();
  let query = supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
 
  if (type) query = query.eq("enquiry_type", type);
  if (unread === "1") query = query.is("read_at", null);
 
  const { data } = await query;
  const rows = (data as ContactSubmission[] | null) ?? [];
 
  const { count: unreadCount } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);
 
  function filterHref(params: { type?: string; unread?: string }): string {
    const sp = new URLSearchParams();
    if (params.type) sp.set("type", params.type);
    if (params.unread) sp.set("unread", params.unread);
    const qs = sp.toString();
    return `/admin/contact-submissions${qs ? `?${qs}` : ""}`;
  }
 
  function chipClass(active: boolean): string {
    return `rounded-full px-3 py-1.5 text-xs font-medium ${
      active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
    }`;
  }
 
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Contact submissions</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enquiries received through the contact form. Emails are sent separately via Microsoft
          Graph — this is the stored audit trail.{" "}
          {(unreadCount ?? 0) > 0 && (
            <span className="font-medium text-neutral-700">{unreadCount} unread.</span>
          )}
        </p>
      </div>
 
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link href={filterHref({ unread })} className={chipClass(!type)}>
          All types
        </Link>
        {ENQUIRY_TYPES.map((t) => (
          <Link key={t} href={filterHref({ type: t, unread })} className={chipClass(type === t)}>
            {t}
          </Link>
        ))}
        <span className="mx-1 text-neutral-300">|</span>
        <Link
          href={filterHref({ type, unread: unread === "1" ? undefined : "1" })}
          className={chipClass(unread === "1")}
        >
          Unread only
        </Link>
      </div>
 
      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {rows.length === 0 && (
          <p className="p-6 text-sm text-neutral-500">No submissions match this filter.</p>
        )}
        {rows.map((submission) => (
          <SubmissionRow key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
}
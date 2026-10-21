import Link from "next/link";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { ContactSubmission } from "@/lib/content/contact-submissions";
import { SubmissionRow } from "@/components/admin/submission-row";
import { RetentionTool } from "@/components/admin/retention-tool";
import { getStaffContext } from "@/lib/admin/staff-context";
import {
  CLIENT_ENQUIRY_TYPES,
  PAGE_SIZE,
  applyEnquiryFilters,
  filtersToSearch,
  parseEnquiryFilters,
  type EnquiryFilters,
} from "@/lib/admin/enquiries";
import { WORK_WITH_US_ENQUIRY_TYPES } from "@/lib/contact/work-with-us";

export const dynamic = "force-dynamic";

function chipClass(active: boolean): string {
  return `rounded-full px-3 py-1.5 text-xs font-medium ${
    active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
  }`;
}

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseEnquiryFilters(await searchParams);
  const staff = await getStaffContext();
  const supabase = await createClient();

  const from = (filters.page - 1) * PAGE_SIZE;
  const listQuery = applyEnquiryFilters(
    supabase.from("contact_submissions").select("*", { count: "exact" }),
    filters
  )
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const [{ data, count, error }, { count: unreadCount }] = await Promise.all([
    listQuery,
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).is("read_at", null),
  ]);
  const rows = (data as ContactSubmission[] | null) ?? [];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Every link keeps the other filters and goes back to page 1.
  const href = (change: Partial<EnquiryFilters>) =>
    `/admin/contact-submissions${filtersToSearch({ ...filters, page: 1, ...change })}`;
  const typeChips = filters.form === "wwu" ? WORK_WITH_US_ENQUIRY_TYPES : filters.form === "client" ? CLIENT_ENQUIRY_TYPES : [];
  const anyFilter = Boolean(filters.form || filters.type || filters.unread || filters.marketing || filters.q);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Enquiries</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Everything sent through the Contact and Work With Us forms, kept here as well as emailed.{" "}
            {(unreadCount ?? 0) > 0 && <span className="font-medium text-neutral-700">{unreadCount} unread.</span>}
          </p>
        </div>
        <a
          href={`/admin/contact-submissions/export${filtersToSearch({ ...filters, page: 1 })}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <Download aria-hidden className="h-4 w-4" />
          Export {anyFilter ? "these" : "all"} as CSV
        </a>
      </div>

      <form action="/admin/contact-submissions" className="mb-4 flex gap-2" role="search">
        {filters.form && <input type="hidden" name="form" value={filters.form} />}
        {filters.type && <input type="hidden" name="type" value={filters.type} />}
        {filters.unread && <input type="hidden" name="unread" value="1" />}
        {filters.marketing && <input type="hidden" name="marketing" value="1" />}
        <label htmlFor="enquiry-search" className="sr-only">
          Search by name, company or email
        </label>
        <input
          id="enquiry-search"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Search by name, company or email"
          className="w-full max-w-sm rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          Search
        </button>
      </form>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link href={href({ form: undefined, type: undefined })} className={chipClass(!filters.form && !filters.type)}>
          All
        </Link>
        <Link href={href({ form: "client", type: undefined })} className={chipClass(filters.form === "client")}>
          Client enquiries
        </Link>
        <Link href={href({ form: "wwu", type: undefined })} className={chipClass(filters.form === "wwu")}>
          Work With Us
        </Link>
        <span className="mx-1 text-neutral-300">|</span>
        <Link href={href({ unread: !filters.unread })} className={chipClass(filters.unread)}>
          Unread only
        </Link>
        <Link href={href({ marketing: !filters.marketing })} className={chipClass(filters.marketing)}>
          Opted in to marketing
        </Link>
      </div>
      {typeChips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {typeChips.map((t) => (
            <Link
              key={t}
              href={href({ type: filters.type === t ? undefined : t })}
              className={chipClass(filters.type === t)}
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Enquiries couldn&apos;t be loaded: {error.message}
        </p>
      )}

      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {rows.length === 0 && (
          <p className="p-6 text-sm text-neutral-500">
            {anyFilter ? "No enquiries match these filters." : "No enquiries yet."}
          </p>
        )}
        {rows.map((submission) => (
          <SubmissionRow key={submission.id} submission={submission} />
        ))}
      </div>

      {total > PAGE_SIZE && (
        <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm text-neutral-600">
          <span>
            {from + 1}–{Math.min(from + PAGE_SIZE, total)} of {total}
          </span>
          <span className="flex gap-2">
            {filters.page > 1 && (
              <Link href={href({ page: filters.page - 1 })} className="rounded-lg border border-neutral-300 px-3 py-1.5">
                Newer
              </Link>
            )}
            {filters.page < pageCount && (
              <Link href={href({ page: filters.page + 1 })} className="rounded-lg border border-neutral-300 px-3 py-1.5">
                Older
              </Link>
            )}
          </span>
        </nav>
      )}

      {staff?.role === "admin" && <RetentionTool />}
    </div>
  );
}

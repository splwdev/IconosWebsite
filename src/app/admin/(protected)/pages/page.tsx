import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPagePublicPath, isSingletonPage, type Page } from "@/lib/content/pages";
import { publishPage, unpublishPage, createBlankPage } from "./actions";
 
const TYPE_LABEL: Record<Page["page_type"], string> = {
  service: "Service",
  program: "Program",
  custom: "Custom page",
  home: "Homepage",
  overview: "Overview page",
};
 
export default async function AdminPagesPage() {
  const supabase = await createClient();
  // RLS ("staff reads all pages") is what allows drafts to show here.
  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .order("page_type", { ascending: true })
    .order("sort_order", { ascending: true });
 
  const rows = (pages as Page[] | null) ?? [];
 
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Pages</h1>
          <p className="mt-1 text-sm text-neutral-500">
            The homepage, overview pages (How We Work, Who We Are), services, How We Work programs, and free-standing custom pages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={createBlankPage.bind(null, "service", "what-we-do")}>
            <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              + New service
            </button>
          </form>
          <form action={createBlankPage.bind(null, "program", "how-we-work")}>
            <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              + New program
            </button>
          </form>
          <form action={createBlankPage.bind(null, "custom", null)}>
            <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
              + New custom page
            </button>
          </form>
        </div>
      </div>
 
      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {rows.length === 0 && <p className="p-6 text-sm text-neutral-500">No pages yet.</p>}
        {rows.map((page) => (
          <div key={page.id} className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    page.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {page.status}
                </span>
                <span className="text-xs text-neutral-400">{TYPE_LABEL[page.page_type]}</span>
              </div>
              <h2 className="mt-1 truncate font-medium text-neutral-900">{page.title}</h2>
              <p className="text-xs text-neutral-400">{getPagePublicPath(page)}</p>
            </div>
 
            <div className="flex flex-shrink-0 gap-2 text-sm">
              <Link
                href={`/admin/pages/${page.id}`}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Edit
              </Link>
              {isSingletonPage(page.page_type) ? null : page.status === "published" ? (
                <form action={unpublishPage.bind(null, page.id)}>
                  <button className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50">
                    Unpublish
                  </button>
                </form>
              ) : (
                <form action={publishPage.bind(null, page.id)}>
                  <button className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700">
                    Publish
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
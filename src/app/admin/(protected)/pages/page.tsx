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
 
/** Overview pages are named by their URL; their title is the page's H1. */
const OVERVIEW_NAMES: Record<string, string> = {
  "who-we-are": "Who We Are",
  "how-we-work": "How We Work",
  "what-we-do": "What We Do (not in the menu)",
  clients: "Clients",
  "work-with-us": "Work With Us",
};
const MAIN_ORDER = ["home", "who-we-are", "what-we-do", "how-we-work", "clients", "work-with-us"];

function pageName(page: Page): string {
  if (page.page_type === "home") return "Homepage";
  if (page.page_type === "overview") return OVERVIEW_NAMES[page.slug] ?? page.slug;
  return page.title;
}

/** Pages grouped the way the site is organised. */
function groupPages(pages: Page[]): { heading: string; pages: Page[] }[] {
  const main = pages
    .filter((p) => p.page_type === "home" || p.page_type === "overview")
    .sort((a, b) => MAIN_ORDER.indexOf(a.page_type === "home" ? "home" : a.slug) - MAIN_ORDER.indexOf(b.page_type === "home" ? "home" : b.slug));
  return [
    { heading: "Main pages", pages: main },
    { heading: "What We Do", pages: pages.filter((p) => p.page_type === "service") },
    { heading: "How We Work", pages: pages.filter((p) => p.page_type === "program") },
    { heading: "Custom pages", pages: pages.filter((p) => p.page_type === "custom") },
  ].filter((g) => g.pages.length > 0);
}

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
            Every page on the site, grouped as in the menu. Contact and the Work With Us form are edited in Settings.
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
 
      {rows.length === 0 && <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">No pages yet.</p>}
      <div className="space-y-8">
        {groupPages(rows).map((group) => (
          <section key={group.heading}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{group.heading}</h2>
            <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
              {group.pages.map((page) => {
                const name = pageName(page);
                const path = getPagePublicPath(page);
                return (
                  <div key={page.id} className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            page.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {page.status}
                        </span>
                        <span className="text-xs text-neutral-400">{TYPE_LABEL[page.page_type]}</span>
                      </div>
                      <h3 className="mt-1 truncate font-medium text-neutral-900">{name}</h3>
                      <p className="truncate text-xs text-neutral-400">
                        {path}
                        {name !== page.title && <> · Heading: {page.title}</>}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 gap-2 text-sm">
                      {page.status === "published" && (
                        <a
                          href={path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-3 py-1.5 font-medium text-neutral-500 hover:text-neutral-900"
                        >
                          View
                        </a>
                      )}
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
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
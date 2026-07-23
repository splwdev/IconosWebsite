import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Theme } from "@/lib/theme/types";
import { previewTheme, publishTheme, duplicateTheme, createBlankTheme } from "./actions";

const STATUS_STYLES: Record<Theme["status"], string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-neutral-200 text-neutral-500",
};

export default async function ThemesPage() {
  const supabase = await createClient();
  // RLS ("staff reads all themes") is what actually allows this to see
  // draft/archived rows — this query has no elevated privileges of its own.
  const { data: themes } = await supabase
    .from("themes")
    .select("*")
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Brand themes</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Preview any theme on the live site before publishing. Only one
            theme is published — and visible to the public — at a time.
          </p>
        </div>
        <form action={createBlankTheme}>
          <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
            + New theme
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(themes as Theme[] | null)?.map((theme) => (
          <div
            key={theme.id}
            className="rounded-xl border border-neutral-200 bg-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[theme.status]}`}
              >
                {theme.status}
              </span>
              <div
                className="h-6 w-6 rounded-full border border-neutral-200"
                style={{ backgroundColor: theme.tokens.colors.accent }}
                title="Accent colour"
              />
            </div>

            <h2 className="font-semibold text-neutral-900">{theme.name}</h2>
            <p className="mt-1 text-xs text-neutral-500">
              {theme.tokens.font_display}
            </p>
            {theme.notes && (
              <p className="mt-2 text-xs text-neutral-400">{theme.notes}</p>
            )}

            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <Link
                href={`/admin/themes/${theme.id}`}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Edit
              </Link>

              <form action={previewTheme.bind(null, theme.id)}>
                <button className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50">
                  Preview
                </button>
              </form>

              <form action={duplicateTheme.bind(null, theme.id)}>
                <button className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50">
                  Duplicate
                </button>
              </form>

              {theme.status !== "published" && (
                <form action={publishTheme.bind(null, theme.id)}>
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

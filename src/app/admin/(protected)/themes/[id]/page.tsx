import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { themeTokensSchema, type Theme } from "@/lib/theme/types";
import { ThemeEditorForm } from "./theme-editor-form";

export default async function ThemeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: theme } = await supabase
    .from("themes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!theme) notFound();

  // Fills defaults for fields added after this theme was saved (e.g. the
  // type scale), so the form always has a value for every input. If the
  // stored tokens are invalid, the form starts from the raw values and the
  // validation messages show what needs fixing.
  const parsedTokens = themeTokensSchema.safeParse(theme.tokens);
  const editableTheme = { ...theme, tokens: parsedTokens.success ? parsedTokens.data : theme.tokens } as Theme;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900">
        Edit theme
      </h1>
      <p className="mb-8 text-sm text-neutral-500">
        {theme.status === "published"
          ? "This theme is live — duplicate it to make changes, then publish the copy when ready."
          : "Changes save as a draft. Use Preview from the themes list to see them on the real site before publishing."}
      </p>
      <ThemeEditorForm theme={editableTheme} />
    </div>
  );
}

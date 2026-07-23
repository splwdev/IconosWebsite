"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { themeTokensSchema, type Theme } from "@/lib/theme/types";
import { ALLOWED_FONTS } from "@/lib/theme/fonts";
import { checkThemeContrast } from "@/lib/theme/contrast";
import { saveTheme } from "../actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  notes: z.string().optional(),
  tokens: themeTokensSchema,
});

type FormValues = z.infer<typeof formSchema>;

const COLOR_FIELDS: Array<{ key: keyof FormValues["tokens"]["colors"]; label: string }> = [
  { key: "dark", label: "Dark (headings, buttons)" },
  { key: "darker", label: "Darker (footers, deep panels)" },
  { key: "accent", label: "Accent (CTAs, highlights)" },
  { key: "accent_soft", label: "Accent — soft (badges, tints)" },
  { key: "cream", label: "Cream (section backgrounds)" },
  { key: "white", label: "White" },
];

export function ThemeEditorForm({ theme }: { theme: Theme }) {
  const isPublished = theme.status === "published";
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: theme.name,
      notes: theme.notes ?? "",
      tokens: theme.tokens,
    },
  });

  const liveTokens = watch("tokens");
  const contrastResult = checkThemeContrast(liveTokens);

  function onSubmit(values: FormValues) {
    setSaved(false);
    setSaveError(null);
    startTransition(async () => {
      const result = await saveTheme(theme.id, {
        name: values.name,
        notes: values.notes ?? "",
        tokensJson: JSON.stringify(values.tokens),
      });
      if (!result.ok) {
        setSaveError(result.errors ?? ["Something went wrong."]);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-8"
      aria-disabled={isPublished}
    >
      <fieldset disabled={isPublished} className="space-y-8 disabled:opacity-60">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Theme name
          </label>
          <input
            {...register("name")}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Display &amp; body font
          </label>
          <select
            {...register("tokens.font_display")}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {ALLOWED_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-400">
            Limited to a pre-approved font list — keeps every theme
            accessible and fast to load.
          </p>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-neutral-700">
            Colours
          </span>
          <div className="grid grid-cols-2 gap-4">
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
                  <input
                    type="color"
                    {...register(`tokens.colors.${key}` as const)}
                    className="h-8 w-8 cursor-pointer rounded border border-neutral-300"
                  />
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Corner style
          </label>
          <select
            {...register("tokens.radius")}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="pill">Pill (fully rounded buttons)</option>
            <option value="rounded">Rounded</option>
            <option value="square">Square</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Internal notes
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="e.g. where this concept came from, who approved it"
          />
        </div>

        {!contrastResult.passes && (
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="mb-1 font-medium">Accessibility warning</p>
            <ul className="list-inside list-disc">
              {contrastResult.failures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-1 text-xs">
              This theme can still be saved as a draft, but cannot be
              published until contrast passes.
            </p>
          </div>
        )}

        {saveError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}

        {saved && (
          <p className="text-sm text-emerald-700">Draft saved.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save draft"}
        </button>
      </fieldset>

      {isPublished && (
        <p className="text-sm text-neutral-500">
          This is the live theme, so it&apos;s locked from direct edits.
          Duplicate it from the themes list to make and preview changes.
        </p>
      )}
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TYPE_STYLES,
  TYPE_STYLE_LABELS,
  themeTokensSchema,
  typeScaleWarnings,
  type Theme,
} from "@/lib/theme/types";
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
  const sizeWarnings = liveTokens.type_scale ? typeScaleWarnings(liveTokens.type_scale) : [];

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

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-neutral-700">Fonts</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="font_body" className="mb-1 block text-xs text-neutral-500">
                Main font <span className="text-neutral-400">(body text, buttons, navigation)</span>
              </label>
              <select
                id="font_body"
                {...register("tokens.font_body")}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                {ALLOWED_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="font_display" className="mb-1 block text-xs text-neutral-500">
                Headings font <span className="text-neutral-400">(H1–H4)</span>
              </label>
              <select
                id="font_display"
                {...register("tokens.font_display")}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                {ALLOWED_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Limited to a pre-approved font list — keeps every theme accessible and fast to load. Pick
            the same font in both for one font across the whole site.
          </p>
        </fieldset>

        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-neutral-700">Font sizes</legend>
          <p className="mb-3 text-xs text-neutral-500">
            In pixels. Sizes scale smoothly from the mobile value on phones to the desktop value on
            screens 1280px and wider.
          </p>
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Style</th>
                  <th scope="col" className="w-24 px-3 py-2 font-medium">Desktop</th>
                  <th scope="col" className="w-24 px-3 py-2 font-medium">Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {TYPE_STYLES.map((style) => {
                  const rowErrors = errors.tokens?.type_scale?.[style];
                  const message = rowErrors?.desktop?.message ?? rowErrors?.mobile?.message ?? rowErrors?.message;
                  return (
                    <tr key={style}>
                      <th scope="row" className="px-3 py-2 text-left font-normal">
                        <span
                          className="block font-medium leading-tight text-neutral-900"
                          // Preview at the desktop size, capped so the table stays usable.
                          style={{
                            fontSize: `${Math.min(liveTokens.type_scale?.[style]?.desktop || 16, 40)}px`,
                          }}
                        >
                          {TYPE_STYLE_LABELS[style].label}
                        </span>
                        <span className="text-xs text-neutral-400">{TYPE_STYLE_LABELS[style].usedFor}</span>
                        {message && <span className="mt-1 block text-xs text-red-600">{message}</span>}
                      </th>
                      {(["desktop", "mobile"] as const).map((device) => (
                        <td key={device} className="px-3 py-2 align-top">
                          <label className="sr-only" htmlFor={`size-${style}-${device}`}>
                            {TYPE_STYLE_LABELS[style].label} {device} size in pixels
                          </label>
                          <input
                            id={`size-${style}-${device}`}
                            type="number"
                            inputMode="numeric"
                            step={1}
                            {...register(`tokens.type_scale.${style}.${device}` as const, { valueAsNumber: true })}
                            className="w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sizeWarnings.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-amber-700">
              {sizeWarnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </fieldset>

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

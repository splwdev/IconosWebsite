"use client";
 
import { useTransition } from "react";
import { deleteTheme } from "@/app/admin/(protected)/themes/actions";
 
export function DeleteThemeButton({
  themeId,
  themeName,
}: {
  themeId: string;
  themeName: string;
}) {
  const [isDeleting, startDeleting] = useTransition();
 
  return (
    <button
      type="button"
      disabled={isDeleting}
      onClick={() => {
        if (confirm(`Delete "${themeName}"? This can't be undone.`)) {
          startDeleting(() => deleteTheme(themeId));
        }
      }}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isDeleting ? "Deleting…" : "Delete"}
    </button>
  );
}
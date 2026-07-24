"use client";

import { exitPreview } from "@/app/admin/(protected)/themes/actions";
import { useTransition } from "react";

export function ExitPreviewButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => exitPreview())}
      className="rounded-brand border border-white/40 px-3 py-1 text-xs font-medium hover:bg-white/10 disabled:opacity-50"
    >
      {isPending ? "Exiting…" : "Exit preview"}
    </button>
  );
}

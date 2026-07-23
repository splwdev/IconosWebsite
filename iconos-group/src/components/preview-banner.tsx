import { ExitPreviewButton } from "./exit-preview-button";

export function PreviewBanner({ themeName }: { themeName: string }) {
  return (
    <div className="sticky top-0 z-[999] flex items-center justify-center gap-4 bg-neutral-900 px-4 py-2 text-sm text-white">
      <span>
        Previewing theme: <strong>{themeName}</strong> — only visible to you
      </span>
      <ExitPreviewButton />
    </div>
  );
}

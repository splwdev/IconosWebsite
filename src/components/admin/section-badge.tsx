import type { LucideIcon } from "lucide-react";

export function AdminSectionBadge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
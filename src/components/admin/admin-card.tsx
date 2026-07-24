import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface AdminCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  stat?: string;
}

export function AdminCard({ icon: Icon, title, description, href, stat }: AdminCardProps) {
  const content = (
    <>
      <div className="mb-4 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
          <Icon className="h-5 w-5" />
        </span>
        {!href && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-400">
            Coming soon
          </span>
        )}
      </div>
      <h2 className="font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      {stat && <p className="mt-3 text-sm font-medium text-neutral-700">{stat}</p>}
    </>
  );

  if (!href) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 opacity-60">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="block rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
    >
      {content}
    </Link>
  );
}
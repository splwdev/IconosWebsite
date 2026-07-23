import Link from "next/link";
import { signOut } from "./actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-700">
          <Link href="/admin/posts">Posts</Link>
          <Link href="/admin/themes">Themes</Link>
          <Link href="/" target="_blank" className="text-neutral-400">
            View live site ↗
          </Link>
        </nav>
        <form action={signOut}>
          <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900">
            Sign out
          </button>
        </form>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}

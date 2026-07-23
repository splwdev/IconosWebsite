import { signInWithMicrosoft } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 text-center shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-brand-dark">
          Iconos Group admin
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          Sign in with your Microsoft 365 account.
        </p>

        {error === "not_authorized" && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Your Microsoft account signed in successfully, but it isn&apos;t
            on the Iconos staff list yet. Ask an admin to add you.
          </p>
        )}

        <form action={signInWithMicrosoft}>
          <button
            type="submit"
            className="w-full rounded-brand bg-brand-dark px-6 py-3 text-sm font-semibold text-white"
          >
            Continue with Microsoft
          </button>
        </form>
      </div>
    </main>
  );
}

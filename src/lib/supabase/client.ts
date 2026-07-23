import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (e.g. the theme editor form).
 * Safe to expose: uses the public anon key, protected entirely by RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

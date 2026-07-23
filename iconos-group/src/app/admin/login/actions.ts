"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMicrosoft() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      // Restricts to a specific Entra ID tenant, set in Supabase's Azure
      // provider config too (belt and braces). See README for setup.
      scopes: "email openid profile",
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/admin/login?error=oauth_failed");
  }

  redirect(data.url);
}

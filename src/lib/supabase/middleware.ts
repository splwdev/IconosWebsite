import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { MAINTENANCE_PATH, isMaintenanceExempt, readMaintenance } from "@/lib/settings/maintenance";

/**
 * Runs on every request. Three jobs:
 *  1. Refresh the Supabase auth session (required by @supabase/ssr).
 *  2. Gate /admin/** to signed-in users who ALSO appear in staff_users.
 *  3. Maintenance mode: while it's switched on, show the maintenance page
 *     (503) for every public address. Admin, sign-in and signed-in staff
 *     are unaffected; staff see a banner instead.
 *     Being signed in via Entra ID only proves identity — it does not by
 *     itself grant access. This mirrors the RLS policies in
 *     0001_theme_management.sql so the UI never even loads for non-staff.
 */
export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const { data: staffRow } = await supabase
      .from("staff_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!staffRow) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "not_authorized");
      return NextResponse.redirect(url);
    }
  }

  const pathname = request.nextUrl.pathname;
  if (!isMaintenanceExempt(pathname)) {
    const maintenance = await readMaintenance(supabase);
    if (maintenance.enabled) {
      const isStaff = user
        ? Boolean(
            (await supabase.from("staff_users").select("user_id").eq("user_id", user.id).maybeSingle()).data
          )
        : false;

      if (isStaff) {
        // Staff see the real site, with a banner (read in the site layout).
        requestHeaders.set("x-maintenance-preview", "1");
        const preview = NextResponse.next({ request: { headers: requestHeaders } });
        response.cookies.getAll().forEach((cookie) => preview.cookies.set(cookie));
        preview.headers.set("Cache-Control", "private, no-store");
        return preview;
      }

      // Everyone else: the maintenance page at whatever address they asked
      // for. A rewrite (not a redirect) with 503 + Retry-After tells search
      // engines this is temporary, so pages aren't dropped from results.
      const url = request.nextUrl.clone();
      url.pathname = MAINTENANCE_PATH;
      url.search = "";
      const page = NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
        status: 503,
        headers: { "Retry-After": "3600", "Cache-Control": "no-store" },
      });
      response.cookies.getAll().forEach((cookie) => page.cookies.set(cookie));
      return page;
    }
  }

  return response;
}

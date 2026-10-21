import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStaffContext } from "@/lib/admin/staff-context";
import { applyEnquiryFilters, enquiriesToCsv, parseEnquiryFilters } from "@/lib/admin/enquiries";
import type { ContactSubmission } from "@/lib/content/contact-submissions";

export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;

/**
 * CSV of the enquiries matching the inbox's current filters. Route
 * handlers don't run the admin layout, so access is checked here; RLS
 * also only lets staff read submissions.
 */
export async function GET(request: NextRequest) {
  const staff = await getStaffContext();
  if (!staff) return new NextResponse("Not authorised", { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = parseEnquiryFilters(params);

  const supabase = await createClient();
  const query = applyEnquiryFilters(supabase.from("contact_submissions").select("*"), filters);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(MAX_ROWS);
  if (error) return new NextResponse(`Export failed: ${error.message}`, { status: 500 });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(enquiriesToCsv((data as ContactSubmission[] | null) ?? []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="iconos-enquiries-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

import { getStaffList } from "./actions";
import { AddStaffForm } from "@/components/admin/add-staff-form";
import { StaffMemberRow } from "@/components/admin/staff-member-row";
 
// Forces this route to always render fresh, bypassing any caching layer
// entirely — added specifically to rule out a suspected OpenNext
// incremental-cache issue where this URL was intermittently returning a
// different page's rendered content. Admin pages should never be cached
// anyway (auth-sensitive, DB-driven), so this is safe regardless of
// whether it turns out to be the actual fix.
export const dynamic = "force-dynamic";
export const revalidate = 0;
 
export default async function AdminStaffPage() {
  const staff = await getStaffList();
 
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Staff access</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage who can sign in to this admin area. Someone must sign in with Microsoft at
          least once — even if they see &ldquo;not authorized&rdquo; — before they can be added
          here, since that first attempt is what creates their account record.
        </p>
      </div>
 
      <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-neutral-900">Add staff member</h2>
        <AddStaffForm />
      </div>
 
      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {staff.length === 0 && <p className="p-6 text-sm text-neutral-500">No staff yet.</p>}
        {staff.map((member) => (
          <StaffMemberRow key={member.user_id} member={member} />
        ))}
      </div>
    </div>
  );
}
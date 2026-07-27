"use client";
 
import { useState, useTransition } from "react";
import {
  updateStaffRole,
  removeStaffMember,
  type StaffMember,
  type StaffRole,
} from "../../app/admin/(protected)/staff/actions";
 
export function StaffMemberRow({ member }: { member: StaffMember }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
 
  function handleRoleChange(role: StaffRole) {
    setError(null);
    startTransition(async () => {
      const result = await updateStaffRole(member.user_id, role);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }
 
  function handleRemove() {
    if (!confirm(`Remove ${member.email} from staff access?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await removeStaffMember(member.user_id);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }
 
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-5">
      <div>
        <p className="font-medium text-neutral-900">{member.email}</p>
        <p className="text-xs text-neutral-400">
          Added {new Date(member.created_at).toLocaleDateString("en-GB")}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex items-center gap-3">
        <select
          value={member.role}
          disabled={isPending}
          onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none disabled:opacity-50"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          disabled={isPending}
          onClick={handleRemove}
          className="text-sm font-medium text-red-600 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
"use client";
 
import { useState, useTransition } from "react";
import { addStaffMember, type StaffRole } from "../../app/admin/(protected)/staff/actions";
 
const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
 
export function AddStaffForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
 
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await addStaffMember(email, role);
      if (result.ok) {
        setMessage({ ok: true, text: "Added." });
        setEmail("");
        setRole("staff");
      } else {
        setMessage({ ok: false, text: result.error ?? "Something went wrong." });
      }
    });
  }
 
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@iconos-group.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className={inputClass}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add"}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
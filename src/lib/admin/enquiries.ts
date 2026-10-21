import { ENQUIRY_TYPES } from "../contact/enquiry";
import { WORK_WITH_US_ENQUIRY_TYPES } from "../contact/work-with-us";
import type { ContactSubmission } from "../content/contact-submissions";

/**
 * Filters for the admin Enquiries inbox, shared by the list page and the
 * CSV export so both always agree on what's selected.
 */

export const CLIENT_ENQUIRY_TYPES: readonly string[] = ENQUIRY_TYPES;
export const ALL_ENQUIRY_TYPES: readonly string[] = [...ENQUIRY_TYPES, ...WORK_WITH_US_ENQUIRY_TYPES];
export const PAGE_SIZE = 25;

export type EnquiryForm = "client" | "wwu";

export interface EnquiryFilters {
  form?: EnquiryForm;
  type?: string;
  unread: boolean;
  marketing: boolean;
  q: string;
  page: number;
}

type Param = string | string[] | undefined;
const first = (v: Param) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Reads filters from the address bar, ignoring anything unexpected. */
export function parseEnquiryFilters(params: Record<string, Param>): EnquiryFilters {
  const form = first(params.form);
  const type = first(params.type);
  const page = Number.parseInt(first(params.page), 10);
  return {
    form: form === "client" || form === "wwu" ? form : undefined,
    type: ALL_ENQUIRY_TYPES.includes(type) ? type : undefined,
    unread: first(params.unread) === "1",
    marketing: first(params.marketing) === "1",
    q: searchTerm(first(params.q)),
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
  };
}

/**
 * Search text made safe for a PostgREST or() filter: the value is quoted
 * there, and characters that could break out of the quotes or act as
 * wildcards (quotes, backslashes, commas, brackets, * and %) are dropped.
 * Length is capped.
 */
export function searchTerm(raw: string): string {
  return raw.replace(/[,()*%\\"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function filtersToSearch(filters: Partial<EnquiryFilters>): string {
  const sp = new URLSearchParams();
  if (filters.form) sp.set("form", filters.form);
  if (filters.type) sp.set("type", filters.type);
  if (filters.unread) sp.set("unread", "1");
  if (filters.marketing) sp.set("marketing", "1");
  if (filters.q) sp.set("q", filters.q);
  if (filters.page && filters.page > 1) sp.set("page", String(filters.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/** Minimal shape of a Supabase filter builder, so this stays testable. */
interface FilterBuilder {
  eq(column: string, value: unknown): FilterBuilder;
  in(column: string, values: readonly unknown[]): FilterBuilder;
  is(column: string, value: null): FilterBuilder;
  or(filters: string): FilterBuilder;
}

/** Applies the filters to a contact_submissions query, returning the same builder type. */
export function applyEnquiryFilters<T>(query: T, filters: EnquiryFilters): T {
  let q = query as unknown as FilterBuilder;
  if (filters.type) q = q.eq("enquiry_type", filters.type);
  else if (filters.form === "client") q = q.in("enquiry_type", CLIENT_ENQUIRY_TYPES);
  else if (filters.form === "wwu") q = q.in("enquiry_type", WORK_WITH_US_ENQUIRY_TYPES);
  if (filters.unread) q = q.is("read_at", null);
  if (filters.marketing) q = q.eq("marketing_opt_in", true);
  if (filters.q) {
    const term = `"%${filters.q}%"`;
    q = q.or(`name.ilike.${term},company.ilike.${term},email.ilike.${term}`);
  }
  return q as unknown as T;
}

/** Retention periods offered by the "delete older than" tool. */
export const RETENTION_MONTH_OPTIONS = [6, 12, 24, 36] as const;

/**
 * A spreadsheet cell, quoted, with formula characters neutralised so a
 * malicious answer like =HYPERLINK(...) can't run when opened in Excel.
 */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const CSV_COLUMNS: { header: string; value: (s: ContactSubmission) => unknown }[] = [
  { header: "Received (UTC)", value: (s) => s.created_at },
  { header: "Enquiry type", value: (s) => s.enquiry_type },
  { header: "First name", value: (s) => s.first_name || s.name },
  { header: "Last name", value: (s) => s.last_name },
  { header: "Email", value: (s) => s.email },
  { header: "Phone", value: (s) => s.phone },
  { header: "Job title", value: (s) => s.job_title },
  { header: "Company", value: (s) => s.company },
  { header: "Employees", value: (s) => s.company_size },
  { header: "Sector", value: (s) => s.sector },
  { header: "LinkedIn", value: (s) => s.linkedin_url },
  {
    header: "Follow-up answers",
    value: (s) => (s.service_details ?? []).map((d) => `${d.question}: ${d.answer}`).join("; "),
  },
  { header: "Message", value: (s) => s.message },
  { header: "Heard about us", value: (s) => s.heard_about },
  { header: "Marketing opt-in", value: (s) => (s.marketing_opt_in ? "Yes" : "No") },
  { header: "Opted in at (UTC)", value: (s) => s.marketing_opt_in_at ?? "" },
  { header: "Opt-in wording", value: (s) => s.marketing_opt_in_wording },
  { header: "Email sent", value: (s) => (s.email_sent ? "Yes" : "No") },
  { header: "Read", value: (s) => (s.read_at ? "Yes" : "No") },
];

export function enquiriesToCsv(rows: ContactSubmission[]): string {
  const lines = [
    CSV_COLUMNS.map((c) => csvCell(c.header)).join(","),
    ...rows.map((row) => CSV_COLUMNS.map((c) => csvCell(c.value(row))).join(",")),
  ];
  // Byte-order mark so Excel opens it as UTF-8 (accents, curly quotes).
  return `﻿${lines.join("\r\n")}\r\n`;
}

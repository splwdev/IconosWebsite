import { describe, expect, it } from "vitest";
import {
  applyEnquiryFilters,
  csvCell,
  enquiriesToCsv,
  filtersToSearch,
  parseEnquiryFilters,
  searchTerm,
} from "./enquiries";
import type { ContactSubmission } from "../content/contact-submissions";

describe("parseEnquiryFilters", () => {
  it("reads known filters and ignores the rest", () => {
    expect(
      parseEnquiryFilters({ form: "wwu", type: "Referral Partner", unread: "1", marketing: "0", q: " acme ", page: "3" })
    ).toEqual({ form: "wwu", type: "Referral Partner", unread: true, marketing: false, q: "acme", page: 3 });
  });

  it("drops unknown types, forms and silly page numbers", () => {
    expect(parseEnquiryFilters({ form: "x", type: "'; drop table", page: "-2" })).toMatchObject({
      form: undefined,
      type: undefined,
      page: 1,
    });
  });
});

describe("searchTerm", () => {
  it("keeps emails searchable", () => {
    expect(searchTerm("ada@acme.co.uk")).toBe("ada@acme.co.uk");
  });

  it("removes characters that could break out of the filter", () => {
    expect(searchTerm('a"),email.eq.x,(b*%\\')).toBe("a email.eq.x b");
  });

  it("caps the length", () => {
    expect(searchTerm("x".repeat(200))).toHaveLength(80);
  });
});

describe("filtersToSearch", () => {
  it("round-trips", () => {
    const qs = filtersToSearch({ form: "client", unread: true, q: "acme", page: 2 });
    expect(qs).toBe("?form=client&unread=1&q=acme&page=2");
    expect(parseEnquiryFilters(Object.fromEntries(new URLSearchParams(qs)))).toMatchObject({
      form: "client",
      unread: true,
      q: "acme",
      page: 2,
    });
  });
});

describe("applyEnquiryFilters", () => {
  it("builds the expected query calls", () => {
    const calls: string[] = [];
    const builder = {
      eq: (c: string, v: unknown) => (calls.push(`eq ${c} ${v}`), builder),
      in: (c: string, v: readonly unknown[]) => (calls.push(`in ${c} ${v.length}`), builder),
      is: (c: string) => (calls.push(`is ${c}`), builder),
      or: (f: string) => (calls.push(`or ${f}`), builder),
    };
    applyEnquiryFilters(builder, { form: "wwu", unread: true, marketing: true, q: "acme", page: 1 });
    expect(calls).toEqual([
      "in enquiry_type 3",
      "is read_at",
      "eq marketing_opt_in true",
      'or name.ilike."%acme%",company.ilike."%acme%",email.ilike."%acme%"',
    ]);
  });
});

describe("CSV export", () => {
  it("quotes cells and neutralises spreadsheet formulas", () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+44 20")).toBe('"\'+44 20"');
    expect(csvCell(null)).toBe('""');
  });

  it("has a header row and one line per enquiry", () => {
    const row = {
      created_at: "2026-10-21T12:00:00Z",
      enquiry_type: "Ad Hoc Work",
      name: "Ada Lovelace",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      service_details: [{ question: "When do you need help by?", answer: "As soon as possible" }],
      message: "Line one\nline two",
      marketing_opt_in: false,
      email_sent: true,
      read_at: null,
    } as unknown as ContactSubmission;
    const csv = enquiriesToCsv([row]);
    const lines = csv.replace(/^﻿/, "").trimEnd().split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('"Enquiry type"');
    expect(lines[1]).toContain('"When do you need help by?: As soon as possible"');
    expect(lines[1]).toContain('"Line one\nline two"');
  });
});

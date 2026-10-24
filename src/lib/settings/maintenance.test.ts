import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_MAINTENANCE,
  clearMaintenanceCache,
  isMaintenanceExempt,
  parseMaintenance,
  readMaintenance,
} from "./maintenance";

describe("isMaintenanceExempt", () => {
  it.each(["/admin", "/admin/settings", "/admin/login", "/auth/callback", "/maintenance", "/_next/static/x.js", "/favicon.ico", "/robots.txt", "/logo.png"])(
    "keeps %s working",
    (path) => expect(isMaintenanceExempt(path)).toBe(true)
  );

  it.each(["/", "/contact", "/who-we-are", "/how-we-work/virtual-data-protection-officer", "/blog/some-post", "/administrator", "/admin-tools", "/maintenance-old", "/work-with-us/enquiry"])(
    "shows the maintenance page for %s",
    (path) => expect(isMaintenanceExempt(path)).toBe(false)
  );
});

describe("parseMaintenance", () => {
  it("reads a valid setting", () => {
    expect(parseMaintenance({ enabled: true, heading: "Back soon", message: "Updating." })).toEqual({
      enabled: true,
      heading: "Back soon",
      message: "Updating.",
    });
  });

  it("treats anything unexpected as off", () => {
    expect(parseMaintenance(null).enabled).toBe(false);
    expect(parseMaintenance({ enabled: "yes" }).enabled).toBe(false);
    expect(parseMaintenance([]).enabled).toBe(false);
  });
});

describe("readMaintenance", () => {
  beforeEach(() => clearMaintenanceCache());

  it("caches for 15 seconds", async () => {
    let calls = 0;
    const client = {
      rpc: async () => {
        calls += 1;
        return { data: { enabled: true, heading: "h", message: "m" }, error: null };
      },
    };
    expect((await readMaintenance(client, 1_000)).enabled).toBe(true);
    await readMaintenance(client, 10_000);
    expect(calls).toBe(1);
    await readMaintenance(client, 20_000);
    expect(calls).toBe(2);
  });

  it("keeps the site up if the switch can't be read", async () => {
    expect(await readMaintenance({ rpc: async () => ({ data: null, error: { message: "nope" } }) })).toEqual(
      DEFAULT_MAINTENANCE
    );
    expect(
      await readMaintenance({
        rpc: async () => {
          throw new Error("network");
        },
      })
    ).toEqual(DEFAULT_MAINTENANCE);
  });
});

describe("0034_maintenance_mode.sql", () => {
  const sql = readFileSync(resolve(__dirname, "../../../supabase/migrations/0034_maintenance_mode.sql"), "utf8");

  it("starts switched off and doesn't overwrite an existing setting", () => {
    expect(sql).toMatch(/'enabled', false/);
    expect(sql).toMatch(/on conflict \(key\) do nothing/);
  });

  it("exposes only the switch, heading and message", () => {
    expect(sql).toMatch(/security definer/);
    expect(sql).toMatch(/jsonb_build_object\(\s*'enabled'[\s\S]*'heading'[\s\S]*'message'/);
    expect(sql).toMatch(/grant execute on function public\.get_maintenance\(\) to anon, authenticated/);
  });
});

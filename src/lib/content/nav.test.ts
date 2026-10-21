import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildPrimaryNav } from "./nav";

describe("blog switch", () => {
  it("leaves Blog out of the menu while it's switched off", () => {
    const labels = (show: boolean) => buildPrimaryNav([], [], [], show).map((i) => i.label);
    expect(labels(false)).not.toContain("Blog");
    expect(labels(true)).toContain("Blog");
  });

  it("keeps custom page links either way", () => {
    const nav = buildPrimaryNav([], [], [{ label: "Events", href: "/events" }], false);
    expect(nav.at(-1)).toEqual({ label: "Events", href: "/events" });
  });

  it("starts switched off and only exposes the boolean publicly (0033)", () => {
    const sql = readFileSync(resolve(__dirname, "../../../supabase/migrations/0033_blog_switch.sql"), "utf8");
    expect(sql).toMatch(/values \('blog', '\{"enabled": false\}'::jsonb\)\s+on conflict \(key\) do nothing/);
    expect(sql).toMatch(/returns boolean/);
    expect(sql).toMatch(/security definer/);
    expect(sql).toMatch(/grant execute on function public\.get_blog_enabled\(\) to anon, authenticated/);
  });
});

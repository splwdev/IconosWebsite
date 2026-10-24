import { z } from "zod";

/**
 * Maintenance mode (admin → Settings). While it's on, every public address
 * shows the maintenance page with a 503 status; admin, sign-in and
 * signed-in staff are unaffected. Stored in site_settings 'maintenance'
 * and read publicly via get_maintenance() (migration 0034).
 */

export const maintenanceSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  heading: z.string().trim().min(1, "Required").max(120, "Keep it under 120 characters").default("We'll be back soon."),
  message: z
    .string()
    .trim()
    .min(1, "Required")
    .max(600, "Keep it under 600 characters")
    .default("Our website is being updated and will be back shortly. In the meantime, we're still here to help."),
});

export type MaintenanceSettings = z.infer<typeof maintenanceSettingsSchema>;

export const DEFAULT_MAINTENANCE: MaintenanceSettings = maintenanceSettingsSchema.parse({});

/** The page shown to visitors while maintenance mode is on (rewritten to, not redirected). */
export const MAINTENANCE_PATH = "/maintenance";

/**
 * Addresses that keep working during maintenance: the admin area and
 * sign-in (so staff can switch it off), the maintenance page itself, and
 * the site's own files (scripts, styles, fonts, images, robots.txt).
 */
export function isMaintenanceExempt(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname === MAINTENANCE_PATH) return true;
  if (pathname.startsWith("/_next/")) return true;
  // Static files such as /favicon.ico, /robots.txt or /brand/logo.png.
  return /\/[^/]+\.[a-z0-9]{2,5}$/i.test(pathname);
}

/** Parses whatever get_maintenance() returned; anything unexpected counts as off. */
export function parseMaintenance(data: unknown): MaintenanceSettings {
  const parsed = maintenanceSettingsSchema.safeParse(data ?? {});
  return parsed.success ? parsed.data : DEFAULT_MAINTENANCE;
}

/** Minimal client shape, so the middleware and tests can pass their own. */
interface RpcClient {
  rpc(fn: "get_maintenance"): PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

const CACHE_MS = 15_000;
let cached: { value: MaintenanceSettings; at: number } | null = null;

/**
 * Reads the switch, cached for 15 seconds per server instance so the
 * middleware isn't querying the database on every request. If it can't be
 * read, the site stays up (fails open) rather than going dark.
 */
export async function readMaintenance(client: RpcClient, now = Date.now()): Promise<MaintenanceSettings> {
  if (cached && now - cached.at < CACHE_MS) return cached.value;
  try {
    const { data, error } = await client.rpc("get_maintenance");
    if (error) {
      console.error("[maintenance] get_maintenance failed:", error.message);
      return DEFAULT_MAINTENANCE;
    }
    const value = parseMaintenance(data);
    cached = { value, at: now };
    return value;
  } catch (err) {
    console.error("[maintenance] Unexpected error reading the switch:", err);
    return DEFAULT_MAINTENANCE;
  }
}

/** For tests, and after an admin changes the setting on this instance. */
export function clearMaintenanceCache(): void {
  cached = null;
}

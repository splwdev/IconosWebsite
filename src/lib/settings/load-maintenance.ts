import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_MAINTENANCE, parseMaintenance, type MaintenanceSettings } from "./maintenance";

/** Maintenance settings for pages (uncached across requests; cached within one). */
export const loadMaintenance = cache(async (): Promise<MaintenanceSettings> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_maintenance");
    if (error) {
      console.error("[maintenance] get_maintenance failed:", error.message);
      return DEFAULT_MAINTENANCE;
    }
    return parseMaintenance(data);
  } catch (err) {
    console.error("[maintenance] Unexpected error:", err);
    return DEFAULT_MAINTENANCE;
  }
});

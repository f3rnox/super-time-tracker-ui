import { type JSONTimeTrackerDB } from "@/lib/types";

/**
 * Serializes a tracker database as formatted JSON for download.
 */
export function build_json_export(db: JSONTimeTrackerDB): string {
  return JSON.stringify(db, null, 2);
}

import { type MergePreference } from "@/lib/pick_merged_time_tracker_entry";

/**
 * Chooses the archived flag when merging sheet or entry records.
 */
export function pick_merged_archived(
  base_archived: boolean | undefined,
  incoming_archived: boolean | undefined,
  prefer: MergePreference,
): boolean | undefined {
  const preferred = prefer === "incoming" ? incoming_archived : base_archived;

  return preferred === true ? true : undefined;
}

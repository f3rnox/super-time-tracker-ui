import { write_active_sheet_preference } from "@/lib/write_active_sheet_preference";

/**
 * Persists the active sheet preference before opening the tracker.
 */
export function navigate_to_tracker_sheet(sheet_name: string): void {
  write_active_sheet_preference(sheet_name);
}

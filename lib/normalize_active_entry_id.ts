import { type TimeSheetEntry } from "@/lib/types";

/**
 * Returns the active id when it still points to a running entry on the sheet.
 */
export function normalize_active_entry_id(
  active_id: number | null,
  entries: TimeSheetEntry[],
): number | null {
  if (active_id === null) {
    return null;
  }

  const entry = entries.find((item) => item.id === active_id);

  if (entry?.end != null) {
    return null;
  }

  return active_id;
}

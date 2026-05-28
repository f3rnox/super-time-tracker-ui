import { get_entry_duration_ms } from "@/lib/get_entry_duration_ms";
import { type SerializedEntry } from "@/lib/types/tracker_state";
import { type TimeSheetEntry } from "@/lib/types";

/**
 * Converts an in-memory entry into a JSON-safe tracker payload.
 */
export function serialize_entry(
  entry: TimeSheetEntry,
  sheet_name: string,
  is_active: boolean,
): SerializedEntry {
  return {
    id: entry.id,
    description: entry.description,
    start: entry.start.toISOString(),
    end: entry.end === null ? null : entry.end.toISOString(),
    tags: entry.tags,
    notes: entry.notes.map(({ timestamp, text }) => ({
      timestamp: timestamp.toISOString(),
      text,
    })),
    sheetName: sheet_name,
    durationMs: get_entry_duration_ms(entry),
    isActive: is_active,
    ...(entry.archived === true ? { archived: true } : {}),
  };
}

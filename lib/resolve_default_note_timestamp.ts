import { type TimeSheetEntry } from "@/lib/types";

/**
 * Picks a default note timestamp that falls within a completed or running entry.
 */
export function resolve_default_note_timestamp(entry: TimeSheetEntry): Date {
  if (entry.end === null) {
    return new Date();
  }

  return entry.end;
}

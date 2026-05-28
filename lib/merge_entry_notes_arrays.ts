import { type TimeSheetEntryNote } from "@/lib/types";

/**
 * Merges two note lists, deduplicating by timestamp and text.
 */
export function merge_entry_notes_arrays(
  primary_notes: TimeSheetEntryNote[],
  secondary_notes: TimeSheetEntryNote[],
): TimeSheetEntryNote[] {
  const seen = new Set<string>();
  const merged: TimeSheetEntryNote[] = [];

  for (const note of [...primary_notes, ...secondary_notes]) {
    const key = `${note.timestamp.getTime()}:${note.text}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(note);
  }

  merged.sort(
    (left, right) => left.timestamp.getTime() - right.timestamp.getTime(),
  );

  return merged;
}

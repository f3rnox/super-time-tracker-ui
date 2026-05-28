import { merge_entry_notes_arrays } from "@/lib/merge_entry_notes_arrays";
import { type TimeSheetEntry } from "@/lib/types";

/**
 * Collapses duplicate entry ids on one sheet, preferring a running entry when ids clash.
 */
export function dedupe_sheet_entries_by_id(
  entries: TimeSheetEntry[],
): TimeSheetEntry[] {
  const by_id = new Map<number, TimeSheetEntry>();

  for (const entry of entries) {
    const existing = by_id.get(entry.id);

    if (existing === undefined) {
      by_id.set(entry.id, entry);
      continue;
    }

    if (entry.end === null && existing.end !== null) {
      by_id.set(entry.id, {
        ...entry,
        notes: merge_entry_notes_arrays(entry.notes, existing.notes),
      });
      continue;
    }

    if (existing.end === null && entry.end !== null) {
      by_id.set(entry.id, {
        ...existing,
        notes: merge_entry_notes_arrays(existing.notes, entry.notes),
      });
      continue;
    }

    by_id.set(entry.id, {
      ...existing,
      notes: merge_entry_notes_arrays(existing.notes, entry.notes),
    });
  }

  return [...by_id.values()].sort((left, right) => left.id - right.id);
}

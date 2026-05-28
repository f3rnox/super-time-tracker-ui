import { gen_sheet } from "@/lib/gen_db";
import { pick_merged_archived } from "@/lib/pick_merged_archived";
import { dedupe_sheet_entries_by_id } from "@/lib/dedupe_sheet_entries_by_id";
import { pick_merged_active_entry_id } from "@/lib/pick_merged_active_entry_id";
import {
  pick_merged_time_tracker_entry,
  type MergePreference,
} from "@/lib/pick_merged_time_tracker_entry";
import {
  type TimeSheet,
  type TimeSheetEntry,
  type TimeTrackerDB,
} from "@/lib/types";

/**
 * Merges one sheet from two tracker databases by name.
 */
export function merge_single_time_tracker_sheet(
  base: TimeTrackerDB,
  incoming: TimeTrackerDB,
  name: string,
  prefer: MergePreference,
): TimeSheet {
  const base_sheet = base.sheets.find((sheet) => sheet.name === name);
  const incoming_sheet = incoming.sheets.find((sheet) => sheet.name === name);

  if (base_sheet === undefined && incoming_sheet === undefined) {
    return gen_sheet(name);
  }

  if (base_sheet === undefined) {
    return incoming_sheet!;
  }

  if (incoming_sheet === undefined) {
    return base_sheet;
  }

  const entry_ids = new Set<number>();

  for (const entry of base_sheet.entries) {
    entry_ids.add(entry.id);
  }

  for (const entry of incoming_sheet.entries) {
    entry_ids.add(entry.id);
  }

  const entries: TimeSheetEntry[] = [...entry_ids]
    .sort((left, right) => left - right)
    .map((id) => {
      const base_entry = base_sheet.entries.find((entry) => entry.id === id);
      const incoming_entry = incoming_sheet.entries.find(
        (entry) => entry.id === id,
      );

      if (base_entry === undefined) {
        return incoming_entry!;
      }

      if (incoming_entry === undefined) {
        return base_entry;
      }

      const merged_entry = pick_merged_time_tracker_entry(
        base_entry,
        incoming_entry,
        prefer,
      );
      const archived = pick_merged_archived(
        base_entry.archived,
        incoming_entry.archived,
        prefer,
      );

      return archived === true
        ? { ...merged_entry, archived: true }
        : merged_entry;
    });

  const active_entry_id = pick_merged_active_entry_id(
    base_sheet.activeEntryID,
    incoming_sheet.activeEntryID,
    entries,
    prefer,
  );

  const sheet_archived = pick_merged_archived(
    base_sheet.archived,
    incoming_sheet.archived,
    prefer,
  );

  return {
    name,
    entries: dedupe_sheet_entries_by_id(entries),
    activeEntryID: active_entry_id,
    ...(sheet_archived === true ? { archived: true } : {}),
  };
}

import { dedupe_sheet_entries_by_id } from "@/lib/dedupe_sheet_entries_by_id";
import { serialize_entry } from "@/lib/serialize_entry";
import { type SerializedEntry } from "@/lib/types/tracker_state";
import { type TimeSheet } from "@/lib/types";

/**
 * Serializes every entry on a time sheet for the web UI.
 */
export function serialize_sheet_entries(sheet: TimeSheet): SerializedEntry[] {
  const { activeEntryID, entries, name } = sheet;

  return dedupe_sheet_entries_by_id(entries).map((entry) =>
    serialize_entry(
      entry,
      name,
      activeEntryID === entry.id && entry.end === null,
    ),
  );
}

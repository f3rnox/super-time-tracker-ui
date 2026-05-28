import { find_running_entry_on_sheet } from "@/lib/find_running_entry_on_sheet";
import { type TimeSheet, type TimeSheetEntry } from "@/lib/types";

/**
 * Resolves an entry on a sheet when duplicate ids exist.
 */
export function find_sheet_entry_by_id(
  sheet: TimeSheet,
  entry_id: number,
): TimeSheetEntry | undefined {
  if (sheet.activeEntryID === entry_id) {
    const running = find_running_entry_on_sheet(sheet);

    if (running !== null) {
      return running;
    }
  }

  const matches = sheet.entries.filter((entry) => entry.id === entry_id);

  if (matches.length === 0) {
    return undefined;
  }

  if (matches.length === 1) {
    return matches[0];
  }

  const running = matches.find((entry) => entry.end === null);

  if (running !== undefined) {
    return running;
  }

  const [first_match, ...other_matches] = matches;

  return other_matches.reduce((latest, entry) => {
    const latest_end = latest.end?.getTime() ?? 0;
    const entry_end = entry.end?.getTime() ?? 0;

    return entry_end >= latest_end ? entry : latest;
  }, first_match);
}

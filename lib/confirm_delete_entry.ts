import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Asks the user to confirm deleting a time sheet entry.
 */
export function confirm_delete_entry(entry: SerializedEntry): boolean {
  const description = entry.description.trim() || "Untitled entry";
  const active_note = entry.isActive ? " This will stop the active timer." : "";

  return window.confirm(
    `Delete entry "${description}" on sheet "${entry.sheetName}"?${active_note}`,
  );
}

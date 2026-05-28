import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";
import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Builds confirm dialog options for deleting a time sheet entry.
 */
export function get_delete_entry_confirm_dialog(
  entry: SerializedEntry,
): ConfirmDialogOptions {
  const description = entry.description.trim() || "Untitled entry";
  const active_note = entry.isActive ? " This will stop the active timer." : "";

  return {
    title: "Delete entry?",
    message: `Delete "${description}" on sheet "${entry.sheetName}"?${active_note}`,
    confirmLabel: "Delete",
    variant: "danger",
  };
}

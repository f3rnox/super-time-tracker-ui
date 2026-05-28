import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";
import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Builds confirm dialog options for deleting multiple time sheet entries.
 */
export function get_delete_entries_confirm_dialog(
  entries: SerializedEntry[],
): ConfirmDialogOptions {
  const count = entries.length;
  const has_active = entries.some((entry) => entry.isActive);
  const active_note = has_active ? " This will stop the active timer." : "";
  const label = count === 1 ? "1 entry" : `${count} entries`;

  return {
    title: count === 1 ? "Delete entry?" : "Delete entries?",
    message: `Permanently delete ${label}?${active_note}`,
    confirmLabel: "Delete",
    variant: "danger",
  };
}

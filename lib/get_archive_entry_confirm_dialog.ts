import { type SerializedEntry } from "@/lib/types/tracker_state";
import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

/**
 * Builds confirm dialog options for archiving a time entry.
 */
export function get_archive_entry_confirm_dialog(
  entry: Pick<SerializedEntry, "description">,
): ConfirmDialogOptions {
  const label =
    entry.description.trim().length > 0
      ? entry.description.trim()
      : "Untitled entry";

  return {
    title: "Archive entry?",
    message: `Archive "${label}"? It will be hidden from the entry list. You can restore it by showing archived entries.`,
    confirmLabel: "Archive",
    variant: "danger",
  };
}

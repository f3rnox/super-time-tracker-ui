import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";
import { type MergeEntryDirection } from "@/lib/get_mergeable_entry_neighbors";
import { type SerializedEntry } from "@/lib/types/tracker_state";

/**
 * Builds confirm dialog options for merging adjacent entries.
 */
export function get_merge_entries_confirm_dialog(
  entry: SerializedEntry,
  direction: MergeEntryDirection,
): ConfirmDialogOptions {
  const description = entry.description.trim() || "Untitled entry";

  const message =
    direction === "previous"
      ? `Merge "${description}" into the previous entry on sheet "${entry.sheetName}"? This entry will be removed.`
      : `Merge the next entry into "${description}" on sheet "${entry.sheetName}"? The next entry will be removed.`;

  return {
    title: "Merge entries?",
    message,
    confirmLabel: "Merge",
  };
}

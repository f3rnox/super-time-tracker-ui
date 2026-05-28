import { confirm_when_enabled } from "@/lib/confirm_when_enabled";
import { get_delete_entry_confirm_dialog } from "@/lib/get_delete_entry_confirm_dialog";
import { get_merge_entries_confirm_dialog } from "@/lib/get_merge_entries_confirm_dialog";
import { get_split_entry_confirm_dialog } from "@/lib/get_split_entry_confirm_dialog";
import { type MergeEntryDirection } from "@/lib/get_mergeable_entry_neighbors";
import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";
import { type SerializedEntry } from "@/lib/types/tracker_state";

type EntryListMenuHandlers = Readonly<{
  on_split: ((at: string) => Promise<void>) | undefined;
  on_merge: ((direction: MergeEntryDirection) => Promise<void>) | undefined;
  on_delete: () => Promise<void>;
}>;

/**
 * Builds confirm-gated action handlers for an entry list row menu.
 */
export function create_entry_list_menu_handlers({
  entry,
  confirm_destructive_actions,
  confirm,
  on_split,
  on_merge,
  on_delete,
}: Readonly<{
  entry: SerializedEntry;
  confirm_destructive_actions: boolean;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  on_split?: (entry: SerializedEntry, at: string) => void;
  on_merge?: (entry: SerializedEntry, direction: MergeEntryDirection) => void;
  on_delete: (entry: SerializedEntry) => void;
}>): EntryListMenuHandlers {
  return {
    on_split:
      on_split === undefined
        ? undefined
        : async (at) => {
            const confirmed = await confirm_when_enabled(
              confirm_destructive_actions,
              () => confirm(get_split_entry_confirm_dialog(entry, at)),
            );

            if (confirmed) {
              on_split(entry, at);
            }
          },
    on_merge:
      on_merge === undefined
        ? undefined
        : async (direction) => {
            const confirmed = await confirm_when_enabled(
              confirm_destructive_actions,
              () => confirm(get_merge_entries_confirm_dialog(entry, direction)),
            );

            if (confirmed) {
              on_merge(entry, direction);
            }
          },
    on_delete: async () => {
      const confirmed = await confirm_when_enabled(
        confirm_destructive_actions,
        () => confirm(get_delete_entry_confirm_dialog(entry)),
      );

      if (confirmed) {
        on_delete(entry);
      }
    },
  };
}

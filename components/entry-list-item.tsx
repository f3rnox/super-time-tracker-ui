"use client";

import { Checkbox } from "@/components/checkbox";
import { EntryActionsMenu } from "@/components/entry-actions-menu";
import {
  EntryEditForm,
  type EntryEditFormValues,
} from "@/components/entry-edit-form";
import { EntryNotesList } from "@/components/entry-notes-list";
import { format_time } from "@/components/format_time";
import { create_entry_list_menu_handlers } from "@/lib/create_entry_list_menu_handlers";
import { entry_can_split } from "@/lib/entry_can_split";
import { format_display_tag } from "@/lib/format_display_tag";
import { format_duration } from "@/lib/format_duration";
import {
  type MergeEntryDirection,
  type MergeableEntryNeighbors,
} from "@/lib/get_mergeable_entry_neighbors";
import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";
import {
  type DurationFormat,
  type TimeFormat,
} from "@/lib/types/ui_preferences";
import {
  type SerializedEntry,
  type SerializedSheet,
} from "@/lib/types/tracker_state";

const tag_item_class =
  "rounded-full bg-tag-bg px-2 py-0.5 text-xs text-tag-text";

type EntryListItemProps = Readonly<{
  entry: SerializedEntry;
  row_key: string;
  is_editing: boolean;
  is_selected: boolean;
  has_selection: boolean;
  show_sheet_name: boolean;
  known_tags: string[];
  is_pending: boolean;
  ai_revise_pending_key: string | null;
  ai_revise_draft: string | undefined;
  time_format: TimeFormat;
  duration_format: DurationFormat;
  sheets: SerializedSheet[];
  merge_neighbors: MergeableEntryNeighbors | undefined;
  can_revise_description_ai: boolean;
  confirm_destructive_actions: boolean;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  on_toggle_entry: (row_key: string) => void;
  on_start_edit: (row_key: string) => void;
  on_clear_ai_revise_draft: (row_key: string) => void;
  on_edit: (entry: SerializedEntry, values: EntryEditFormValues) => void;
  on_add_note: (entry: SerializedEntry, text: string) => void;
  on_resume: (entry: SerializedEntry) => void;
  on_move: (entry: SerializedEntry, target_sheet_name: string) => void;
  on_delete: (entry: SerializedEntry) => void;
  on_edit_note: (
    entry: SerializedEntry,
    timestamp: string,
    text: string,
  ) => void;
  on_split?: (entry: SerializedEntry, at: string) => void;
  on_merge?: (entry: SerializedEntry, direction: MergeEntryDirection) => void;
  on_revise_description_ai: (entry: SerializedEntry) => void;
}>;

/**
 * Renders one entry row in the tracker entry list.
 */
export function EntryListItem({
  entry,
  row_key,
  is_editing,
  is_selected,
  has_selection,
  show_sheet_name,
  known_tags,
  is_pending,
  ai_revise_pending_key,
  ai_revise_draft,
  time_format,
  duration_format,
  sheets,
  merge_neighbors,
  can_revise_description_ai,
  confirm_destructive_actions,
  confirm,
  on_toggle_entry,
  on_start_edit,
  on_clear_ai_revise_draft,
  on_edit,
  on_add_note,
  on_resume,
  on_move,
  on_delete,
  on_edit_note,
  on_split,
  on_merge,
  on_revise_description_ai,
}: EntryListItemProps) {
  const menu_handlers = create_entry_list_menu_handlers({
    entry,
    confirm_destructive_actions,
    confirm,
    on_split,
    on_merge,
    on_delete,
  });

  if (is_editing) {
    return (
      <li className="block border-b border-panel-border py-2.5 last:border-b-0 compact:py-1.5">
        <EntryEditForm
          entry={entry}
          known_tags={known_tags}
          is_pending={is_pending}
          initial_description_override={ai_revise_draft}
          on_cancel={() => on_clear_ai_revise_draft(row_key)}
          on_save={(values) => {
            on_edit(entry, values);
            on_clear_ai_revise_draft(row_key);
          }}
        />
      </li>
    );
  }

  return (
    <li
      className={`group relative flex flex-col gap-0 border-b border-panel-border px-2 py-2.5 transition-colors duration-150 last:border-b-0 hover:bg-surface-hover compact:py-1.5 ${
        is_selected ? "bg-accent-soft hover:bg-accent-soft" : ""
      }`}
    >
      <div className="flex w-full min-w-0 flex-col items-start gap-2.5 min-[700px]:flex-row min-[700px]:items-center compact:gap-1.5">
        <label
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed"
          aria-label={`Select entry ${entry.description || "Untitled entry"}`}
        >
          <Checkbox
            nested
            className={`shrink-0 pr-1 transition-opacity duration-150 compact:pr-0.5 ${
              is_selected || has_selection
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
            checked={is_selected}
            disabled={is_pending}
            on_change={() => on_toggle_entry(row_key)}
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 overflow-wrap-anywhere font-semibold leading-snug compact:text-[0.9rem] compact:leading-tight">
              {entry.description || "Untitled entry"}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[0.8rem] text-muted compact:mt-px compact:gap-0.5 compact:text-[0.72rem]">
              {show_sheet_name ? (
                <>
                  <span>{entry.sheetName}</span>
                  <span>·</span>
                </>
              ) : null}
              <span>#{entry.id}</span>
              <span>·</span>
              <span className="whitespace-nowrap">
                {format_time(entry.start, time_format)}
                {entry.end === null
                  ? " → now"
                  : ` → ${format_time(entry.end, time_format)}`}
              </span>
              {entry.tags.length > 0 ? (
                <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
                  {entry.tags.map((tag) => (
                    <li key={tag} className={tag_item_class}>
                      {format_display_tag(tag)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </label>
        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2 min-[700px]:w-auto min-[700px]:justify-end max-[860px]:flex-wrap compact:gap-1.5">
          <p
            className={`m-0 whitespace-nowrap text-right font-mono text-[0.9rem] text-muted compact:text-[0.8rem] ${
              entry.isActive ? "text-accent" : ""
            }`}
          >
            {format_duration(entry.durationMs, duration_format)}
          </p>
          <EntryActionsMenu
            current_sheet_name={entry.sheetName}
            sheets={sheets}
            is_pending={is_pending || ai_revise_pending_key === row_key}
            can_split={on_split !== undefined && entry_can_split(entry)}
            on_split={menu_handlers.on_split}
            can_merge_previous={merge_neighbors?.previous === true}
            can_merge_next={merge_neighbors?.next === true}
            on_merge={menu_handlers.on_merge}
            on_edit={() => on_start_edit(row_key)}
            on_revise_description_ai={
              can_revise_description_ai
                ? () => on_revise_description_ai(entry)
                : undefined
            }
            can_revise_description_ai={can_revise_description_ai}
            on_add_note={(text) => on_add_note(entry, text)}
            on_resume={() => on_resume(entry)}
            entry_is_active={entry.isActive}
            on_move={(target_sheet_name) => on_move(entry, target_sheet_name)}
            on_delete={menu_handlers.on_delete}
          />
        </div>
      </div>
      {entry.notes.length > 0 ? (
        <div className="w-full pt-1 pl-[calc(0.85rem+0.5rem+0.35rem)] compact:pt-0.5 compact:pl-[calc(0.85rem+0.35rem+0.2rem)]">
          <EntryNotesList
            notes={entry.notes}
            variant="inline"
            is_pending={is_pending}
            on_edit_note={(timestamp, text) =>
              on_edit_note(entry, timestamp, text)
            }
          />
        </div>
      ) : null}
    </li>
  );
}

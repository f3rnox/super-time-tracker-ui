"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { use_confirm_dialog } from "@/lib/use_confirm_dialog";
import { EntryListItem } from "@/components/entry-list-item";
import { type EntryEditFormValues } from "@/components/entry-edit-form";
import { EntryListBulkBar } from "@/components/entry-list-bulk-bar";
import { EntryListIdleHeader } from "@/components/entry-list-idle-header";
import { get_delete_entries_confirm_dialog } from "@/lib/get_delete_entries_confirm_dialog";
import { format_unknown_error } from "@/lib/format_unknown_error";
import { build_entry_list_merge_neighbors_by_key } from "@/lib/build_entry_list_merge_neighbors_by_key";
import { type MergeEntryDirection } from "@/lib/get_mergeable_entry_neighbors";
import { omit_record_key } from "@/lib/omit_record_key";
import { get_api_key_for_suggestion_provider } from "@/lib/get_api_key_for_suggestion_provider";
import { get_entry_row_key } from "@/lib/get_entry_row_key";
import { claude_api_key_preference } from "@/lib/preferences/claude_api_key_preference";
import { entry_suggestion_provider_preference } from "@/lib/preferences/entry_suggestion_provider_preference";
import { google_ai_api_key_preference } from "@/lib/preferences/google_ai_api_key_preference";
import { openai_api_key_preference } from "@/lib/preferences/openai_api_key_preference";
import { request_ai_entry_description_suggestion } from "@/lib/request_ai_entry_description_suggestion";
import { use_confirm_destructive_actions } from "@/lib/use_confirm_destructive_actions";
import { use_escape_to_cancel } from "@/lib/use_escape_to_cancel";
import { use_duration_format } from "@/lib/use_duration_format";
import { use_time_format } from "@/lib/use_time_format";
import {
  type SerializedEntry,
  type SerializedSheet,
} from "@/lib/types/tracker_state";

interface EntryListProps {
  title: string;
  entries: SerializedEntry[];
  /** Full sheet entries used to detect merge neighbors (defaults to entries). */
  merge_context_entries?: SerializedEntry[];
  sheets: SerializedSheet[];
  known_tags: string[];
  total_ms: number;
  empty_message: string;
  is_pending: boolean;
  show_sheet_name?: boolean;
  header_extra?: React.ReactNode;
  on_delete: (entry: SerializedEntry) => void;
  on_archive?: (entry: SerializedEntry) => void;
  on_unarchive?: (entry: SerializedEntry) => void;
  archived_entry_count?: number;
  show_archived_entries?: boolean;
  on_toggle_show_archived?: () => void;
  on_edit: (entry: SerializedEntry, values: EntryEditFormValues) => void;
  on_move: (entry: SerializedEntry, target_sheet_name: string) => void;
  on_move_many: (entries: SerializedEntry[], target_sheet_name: string) => void;
  on_delete_many: (entries: SerializedEntry[]) => void;
  on_edit_note: (
    entry: SerializedEntry,
    timestamp: string,
    original_text: string,
    text: string,
  ) => void;
  on_add_note: (entry: SerializedEntry, text: string) => void;
  on_resume: (entry: SerializedEntry) => void;
  on_split?: (entry: SerializedEntry, at: string) => void;
  on_merge?: (entry: SerializedEntry, direction: MergeEntryDirection) => void;
}

/**
 * Renders a list of time sheet entries with edit and delete actions.
 */
export function EntryList({
  title,
  entries,
  merge_context_entries,
  sheets,
  known_tags,
  total_ms,
  empty_message,
  is_pending,
  show_sheet_name = true,
  header_extra,
  on_delete,
  on_archive,
  on_unarchive,
  archived_entry_count = 0,
  show_archived_entries = false,
  on_toggle_show_archived,
  on_edit,
  on_move,
  on_move_many,
  on_delete_many,
  on_edit_note,
  on_add_note,
  on_resume,
  on_split,
  on_merge,
}: Readonly<EntryListProps>) {
  const { confirm } = use_confirm_dialog();
  const confirm_destructive_actions = use_confirm_destructive_actions();
  const time_format = use_time_format();
  const duration_format = use_duration_format();
  const [editing_key, setEditing_key] = useState<string | null>(null);
  const [selected_keys, setSelected_keys] = useState<Set<string>>(
    () => new Set(),
  );
  const [ai_revise_pending_key, setAi_revise_pending_key] = useState<
    string | null
  >(null);
  const [ai_revise_error, setAi_revise_error] = useState<string | null>(null);
  const [ai_revise_draft_by_key, setAi_revise_draft_by_key] = useState<
    Record<string, string>
  >({});
  const suggestion_provider = useSyncExternalStore(
    entry_suggestion_provider_preference.subscribe,
    entry_suggestion_provider_preference.get_snapshot,
    entry_suggestion_provider_preference.get_server_snapshot,
  );
  const openai_api_key = useSyncExternalStore(
    openai_api_key_preference.subscribe,
    openai_api_key_preference.get_snapshot,
    openai_api_key_preference.get_server_snapshot,
  );
  const claude_api_key = useSyncExternalStore(
    claude_api_key_preference.subscribe,
    claude_api_key_preference.get_snapshot,
    claude_api_key_preference.get_server_snapshot,
  );
  const google_ai_api_key = useSyncExternalStore(
    google_ai_api_key_preference.subscribe,
    google_ai_api_key_preference.get_snapshot,
    google_ai_api_key_preference.get_server_snapshot,
  );
  const selected_api_key = get_api_key_for_suggestion_provider(
    suggestion_provider,
    {
      openai: openai_api_key,
      claude: claude_api_key,
      google_ai: google_ai_api_key,
    },
  );

  const merge_neighbors_by_key = useMemo(
    () =>
      build_entry_list_merge_neighbors_by_key(entries, merge_context_entries),
    [entries, merge_context_entries],
  );
  const can_revise_description_ai =
    suggestion_provider !== "none" && selected_api_key.trim().length > 0;

  const entry_keys = entries.map((entry) => get_entry_row_key(entry));
  const selected_entries = entries.filter((entry) =>
    selected_keys.has(get_entry_row_key(entry)),
  );
  const all_selected =
    entries.length > 0 && selected_entries.length === entries.length;
  const some_selected =
    selected_entries.length > 0 && selected_entries.length < entries.length;

  useEffect(() => {
    const valid_keys = new Set(entry_keys);

    setSelected_keys((previous) => {
      const next = new Set([...previous].filter((key) => valid_keys.has(key)));

      return next.size === previous.size ? previous : next;
    });
  }, [entry_keys]);

  const toggle_entry = (row_key: string): void => {
    setSelected_keys((previous) => {
      const next = new Set(previous);

      if (next.has(row_key)) {
        next.delete(row_key);
      } else {
        next.add(row_key);
      }

      return next;
    });
  };

  const toggle_all = (): void => {
    if (all_selected) {
      setSelected_keys(new Set());
      return;
    }

    setSelected_keys(new Set(entry_keys));
  };

  const clear_selection = (): void => {
    setSelected_keys(new Set());
  };

  const handle_bulk_move = (target_sheet_name: string): void => {
    on_move_many(selected_entries, target_sheet_name);
    clear_selection();
  };

  const handle_bulk_delete = async (): Promise<void> => {
    if (selected_entries.length === 0) {
      return;
    }

    const confirmed = confirm_destructive_actions
      ? await confirm(get_delete_entries_confirm_dialog(selected_entries))
      : true;

    if (!confirmed) {
      return;
    }

    on_delete_many(selected_entries);
    clear_selection();
  };

  const has_selection = selected_entries.length > 0;

  const revise_entry_description_with_ai = async (
    entry: SerializedEntry,
  ): Promise<void> => {
    if (!can_revise_description_ai) {
      return;
    }

    const row_key = get_entry_row_key(entry);
    setAi_revise_pending_key(row_key);
    setAi_revise_error(null);

    try {
      const notes_context = entry.notes.map((note) => note.text).join("\n");
      const description = await request_ai_entry_description_suggestion({
        provider: suggestion_provider,
        api_key: selected_api_key,
        context: entry.description,
        notes: notes_context,
      });
      setAi_revise_draft_by_key((previous) => ({
        ...previous,
        [row_key]: description,
      }));
      setEditing_key(row_key);
    } catch (error: unknown) {
      setAi_revise_error(format_unknown_error(error));
    } finally {
      setAi_revise_pending_key(null);
    }
  };

  use_escape_to_cancel(clear_selection, has_selection && editing_key === null);

  return (
    <section className="min-w-0">
      <header className="mb-3 flex flex-col gap-2 border-b border-panel-border pb-2.5 compact:mb-2 compact:pb-1.5">
        {has_selection ? (
          <EntryListBulkBar
            selected_count={selected_entries.length}
            total_count={entries.length}
            all_selected={all_selected}
            some_selected={some_selected}
            selected_entries={selected_entries}
            sheets={sheets}
            is_pending={is_pending}
            on_toggle_all={toggle_all}
            on_move={handle_bulk_move}
            on_delete={() => {
              handle_bulk_delete().catch(() => {});
            }}
            on_clear={clear_selection}
          />
        ) : (
          <EntryListIdleHeader
            header_extra={header_extra}
            title={title}
            entries_length={entries.length}
            all_selected={all_selected}
            some_selected={some_selected}
            is_pending={is_pending}
            total_ms={total_ms}
            duration_format={duration_format}
            archived_entry_count={archived_entry_count}
            show_archived_entries={show_archived_entries}
            on_toggle_show_archived={on_toggle_show_archived}
            on_toggle_all={toggle_all}
            ai_revise_error={ai_revise_error}
          />
        )}
      </header>
      {entries.length === 0 ? (
        <p className="m-0 text-muted">{empty_message}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {entries.map((entry) => {
            const row_key = get_entry_row_key(entry);

            return (
              <EntryListItem
                key={row_key}
                entry={entry}
                row_key={row_key}
                is_editing={editing_key === row_key}
                is_selected={selected_keys.has(row_key)}
                has_selection={has_selection}
                show_sheet_name={show_sheet_name}
                known_tags={known_tags}
                is_pending={is_pending}
                ai_revise_pending_key={ai_revise_pending_key}
                ai_revise_draft={ai_revise_draft_by_key[row_key]}
                time_format={time_format}
                duration_format={duration_format}
                sheets={sheets}
                merge_neighbors={merge_neighbors_by_key.get(row_key)}
                can_revise_description_ai={can_revise_description_ai}
                confirm_destructive_actions={confirm_destructive_actions}
                confirm={confirm}
                on_toggle_entry={toggle_entry}
                on_start_edit={(key) => {
                  setEditing_key(key);
                  setAi_revise_draft_by_key((previous) =>
                    omit_record_key(previous, key),
                  );
                }}
                on_clear_ai_revise_draft={(key) => {
                  setEditing_key(null);
                  setAi_revise_draft_by_key((previous) =>
                    omit_record_key(previous, key),
                  );
                }}
                on_edit={on_edit}
                on_add_note={on_add_note}
                on_resume={on_resume}
                on_move={on_move}
                on_delete={on_delete}
                on_archive={on_archive}
                on_unarchive={on_unarchive}
                on_edit_note={on_edit_note}
                on_split={on_split}
                on_merge={on_merge}
                on_revise_description_ai={(target) => {
                  revise_entry_description_with_ai(target).catch(() => {});
                }}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

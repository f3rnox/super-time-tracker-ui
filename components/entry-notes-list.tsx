"use client";

import { type MouseEvent, type ReactNode, useState } from "react";

import { ChevronIcon } from "@/components/chevron-icon";
import { format_time } from "@/components/format_time";
import { NoteEditForm } from "@/components/note-edit-form";
import { PencilIcon } from "@/components/pencil-icon";
import { TrashIcon } from "@/components/trash-icon";
import { format_entry_notes_toggle_label } from "@/lib/format_entry_notes_toggle_label";
import { get_entry_notes_item_class } from "@/lib/get_entry_notes_item_class";
import { get_entry_notes_list_class } from "@/lib/get_entry_notes_list_class";
import { get_entry_notes_root_class } from "@/lib/get_entry_notes_root_class";
import { use_time_format } from "@/lib/use_time_format";
import { type SerializedNote } from "@/lib/types/tracker_state";

type EntryNotesListVariant = "panel" | "inline";

interface EntryNotesListProps {
  notes: SerializedNote[];
  variant?: EntryNotesListVariant;
  in_bar?: boolean;
  is_pending?: boolean;
  on_edit_note?: (timestamp: string, text: string) => void;
  on_delete_note?: (timestamp: string) => void;
}

const edit_button_class =
  "inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[0.35rem] border-0 bg-transparent p-0 text-muted hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-55";

/**
 * Renders notes attached to a time sheet entry.
 */
export function EntryNotesList({
  notes,
  variant = "panel",
  in_bar = false,
  is_pending = false,
  on_edit_note,
  on_delete_note,
}: Readonly<EntryNotesListProps>) {
  const time_format = use_time_format();
  const [editing_timestamp, setEditing_timestamp] = useState<string | null>(
    null,
  );
  const [is_expanded, setIs_expanded] = useState(
    variant === "panel" && !in_bar,
  );

  if (notes.length === 0) {
    return null;
  }

  const sorted_notes = [...notes].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  );

  const is_inline = variant === "inline";
  const is_panel_in_bar = variant === "panel" && in_bar;
  const is_list_visible = is_expanded || editing_timestamp !== null;
  const toggle_label = format_entry_notes_toggle_label(notes.length, is_inline);
  const root_class = get_entry_notes_root_class(
    is_inline,
    in_bar,
    is_panel_in_bar,
    is_list_visible,
  );

  const toggle_class = is_inline
    ? "inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-inherit text-xs font-medium normal-case tracking-normal text-muted hover:text-foreground"
    : "inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent px-0 py-0.5 font-inherit text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted hover:text-foreground";

  const list_class = get_entry_notes_list_class(
    is_inline,
    is_panel_in_bar,
    is_list_visible,
  );

  const handle_save = (timestamp: string, text: string): void => {
    on_edit_note?.(timestamp, text);
    setEditing_timestamp(null);
  };

  const start_editing = (timestamp: string): void => {
    setIs_expanded(true);
    setEditing_timestamp(timestamp);
  };

  const handle_delete = (timestamp: string): void => {
    if (editing_timestamp === timestamp) {
      setEditing_timestamp(null);
    }

    on_delete_note?.(timestamp);
  };

  const handle_toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();

    if (editing_timestamp !== null) {
      return;
    }

    setIs_expanded((previous) => !previous);
  };

  return (
    <section className={root_class} aria-label="Entry notes">
      <button
        type="button"
        className={toggle_class}
        aria-expanded={is_list_visible}
        onClick={handle_toggle}
      >
        <ChevronIcon rotated={is_list_visible} />
        <span>{toggle_label}</span>
      </button>
      <ul className={list_class}>
        {sorted_notes.map((note, index) => (
          <EntryNoteListItem
            key={`${note.timestamp}-${index}`}
            note={note}
            is_inline={is_inline}
            is_panel_in_bar={is_panel_in_bar}
            is_pending={is_pending}
            is_editing={editing_timestamp === note.timestamp}
            time_format={time_format}
            on_cancel_edit={() => setEditing_timestamp(null)}
            on_save={(text) => handle_save(note.timestamp, text)}
            on_start_edit={() => start_editing(note.timestamp)}
            on_delete={() => handle_delete(note.timestamp)}
            on_edit_note={on_edit_note}
            on_delete_note={on_delete_note}
          />
        ))}
      </ul>
    </section>
  );
}

interface EntryNoteListItemProps {
  note: SerializedNote;
  is_inline: boolean;
  is_panel_in_bar: boolean;
  is_pending: boolean;
  is_editing: boolean;
  time_format: ReturnType<typeof use_time_format>;
  on_cancel_edit: () => void;
  on_save: (text: string) => void;
  on_start_edit: () => void;
  on_delete: () => void;
  on_edit_note?: (timestamp: string, text: string) => void;
  on_delete_note?: (timestamp: string) => void;
}

function EntryNoteListItem({
  note,
  is_inline,
  is_panel_in_bar,
  is_pending,
  is_editing,
  time_format,
  on_cancel_edit,
  on_save,
  on_start_edit,
  on_delete,
  on_edit_note,
  on_delete_note,
}: Readonly<EntryNoteListItemProps>) {
  const item_class = get_entry_notes_item_class(is_inline, is_panel_in_bar);
  const actions = render_note_actions({
    note,
    is_pending,
    on_start_edit,
    on_delete,
    on_edit_note,
    on_delete_note,
  });

  if (is_editing) {
    return (
      <li className={item_class}>
        <NoteEditForm
          initial_text={note.text}
          inline={is_inline}
          is_pending={is_pending}
          on_cancel={on_cancel_edit}
          on_save={on_save}
        />
      </li>
    );
  }

  if (is_inline) {
    return (
      <li className={item_class}>
        <div className="flex w-full items-start justify-between gap-1.5">
          <p className="m-0 flex min-w-0 flex-1 items-baseline gap-1.5 text-xs leading-snug text-foreground compact:text-[0.72rem]">
            <time
              className="shrink-0 font-mono text-[0.68rem] text-muted"
              dateTime={note.timestamp}
            >
              {format_time(note.timestamp, time_format)}
            </time>
            <span className="min-w-0 overflow-wrap-anywhere whitespace-pre-wrap">
              {note.text}
            </span>
          </p>
          {actions}
        </div>
      </li>
    );
  }

  return (
    <li className={item_class}>
      <div className="flex w-full items-start justify-between gap-1.5">
        <time
          className="font-mono text-[0.72rem] text-muted"
          dateTime={note.timestamp}
        >
          {format_time(note.timestamp, time_format)}
        </time>
        {actions}
      </div>
      <p className="m-0 overflow-wrap-anywhere text-[0.9rem] leading-snug whitespace-pre-wrap">
        {note.text}
      </p>
    </li>
  );
}

interface RenderNoteActionsParams {
  note: SerializedNote;
  is_pending: boolean;
  on_start_edit: () => void;
  on_delete: () => void;
  on_edit_note?: (timestamp: string, text: string) => void;
  on_delete_note?: (timestamp: string) => void;
}

function render_note_actions({
  is_pending,
  on_start_edit,
  on_delete,
  on_edit_note,
  on_delete_note,
}: RenderNoteActionsParams): ReactNode {
  if (on_edit_note === undefined && on_delete_note === undefined) {
    return null;
  }

  return (
    <div className="flex shrink-0 gap-0.5">
      {on_edit_note === undefined ? null : (
        <button
          type="button"
          className={edit_button_class}
          aria-label="Edit note"
          title="Edit note"
          disabled={is_pending}
          onClick={(event) => {
            event.stopPropagation();
            on_start_edit();
          }}
        >
          <PencilIcon />
        </button>
      )}
      {on_delete_note === undefined ? null : (
        <button
          type="button"
          className={`${edit_button_class} hover:text-danger`}
          aria-label="Delete note"
          title="Delete note"
          disabled={is_pending}
          onClick={(event) => {
            event.stopPropagation();
            on_delete();
          }}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

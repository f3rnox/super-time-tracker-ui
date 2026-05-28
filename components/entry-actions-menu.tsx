"use client";

import { useEffect, useRef, useState } from "react";

import { HamburgerIcon } from "@/components/hamburger-icon";
import { prompt_entry_note } from "@/lib/prompt_entry_note";
import { prompt_split_entry_at } from "@/lib/prompt_split_entry_at";
import { type MergeEntryDirection } from "@/lib/get_mergeable_entry_neighbors";
import { use_escape_to_cancel } from "@/lib/use_escape_to_cancel";
import { type SerializedSheet } from "@/lib/types/tracker_state";

interface EntryActionsMenuProps {
  current_sheet_name: string;
  sheets: SerializedSheet[];
  is_pending: boolean;
  on_edit: () => void;
  on_add_note?: (text: string) => void;
  on_show_add_note_form?: () => void;
  on_revise_description_ai?: () => void;
  can_revise_description_ai?: boolean;
  on_resume?: () => void;
  entry_is_active?: boolean;
  can_split?: boolean;
  on_split?: (at: string) => void;
  can_merge_previous?: boolean;
  can_merge_next?: boolean;
  on_merge?: (direction: MergeEntryDirection) => void;
  on_delete: () => void;
  on_archive?: () => void;
  on_unarchive?: () => void;
  entry_is_archived?: boolean;
  on_move: (target_sheet_name: string) => void;
}

const menu_item_class =
  "block w-full cursor-pointer rounded-[0.45rem] border-0 bg-transparent px-2.5 py-1.5 text-left font-inherit text-[0.85rem] text-inherit hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-55";

/**
 * Hamburger menu for entry edit, move, and delete actions.
 */
export function EntryActionsMenu(props: Readonly<EntryActionsMenuProps>) {
  const {
    current_sheet_name,
    sheets,
    is_pending,
    on_edit,
    on_add_note,
    on_show_add_note_form,
    on_revise_description_ai,
    can_revise_description_ai = false,
    on_resume,
    entry_is_active = false,
    can_split = false,
    on_split,
    can_merge_previous = false,
    can_merge_next = false,
    on_merge,
    on_delete,
    on_archive,
    on_unarchive,
    entry_is_archived = false,
    on_move,
  } = props;
  const current_sheet = sheets.find(
    (sheet) => sheet.name === current_sheet_name,
  );
  const resume_blocked =
    entry_is_active ||
    (current_sheet?.hasActiveEntry === true && !entry_is_active);
  const resume_blocked_reason = entry_is_active
    ? "This entry is already active"
    : "Another entry is active on this sheet";
  const other_sheets = sheets.filter(
    (sheet) => sheet.name !== current_sheet_name && sheet.archived !== true,
  );
  const [is_open, setIs_open] = useState(false);
  const menu_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!is_open) {
      return;
    }

    const handle_pointer_down = (event: PointerEvent): void => {
      if (
        menu_ref.current !== null &&
        !menu_ref.current.contains(event.target as Node)
      ) {
        setIs_open(false);
      }
    };

    document.addEventListener("pointerdown", handle_pointer_down);

    return () => {
      document.removeEventListener("pointerdown", handle_pointer_down);
    };
  }, [is_open]);

  const close_menu = (): void => {
    setIs_open(false);
  };

  use_escape_to_cancel(close_menu, is_open);

  return (
    <div className="relative shrink-0" ref={menu_ref}>
      <button
        type="button"
        className="inline-flex cursor-pointer appearance-none items-center justify-center rounded-none border-0 bg-transparent p-0.5 text-muted shadow-none hover:opacity-75 focus-visible:outline-2 focus-visible:outline-input-focus-border focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
        aria-label="Entry actions"
        aria-expanded={is_open}
        aria-haspopup="menu"
        disabled={is_pending}
        onClick={() => setIs_open((open) => !open)}
      >
        <HamburgerIcon />
      </button>
      {is_open ? (
        <div
          className="absolute right-0 top-full z-10 mt-1.5 min-w-56 rounded-md border border-panel-border bg-panel p-1.5 shadow-md"
          role="menu"
        >
          {render_edit_times_item(is_pending, close_menu, on_edit)}
          {render_add_note_item({
            is_pending,
            close_menu,
            on_show_add_note_form,
            on_add_note,
          })}
          {render_revise_description_item({
            is_pending,
            can_revise_description_ai,
            close_menu,
            on_revise_description_ai,
          })}
          {render_resume_item({
            is_pending,
            resume_blocked,
            resume_blocked_reason,
            close_menu,
            on_resume,
          })}
          {render_split_item({
            is_pending,
            can_split,
            close_menu,
            on_split,
          })}
          {render_merge_items({
            is_pending,
            can_merge_previous,
            can_merge_next,
            close_menu,
            on_merge,
          })}
          <div role="none">
            <hr
              className="my-1 border-0 border-t border-panel-border"
              aria-hidden="true"
            />
          </div>
          <div role="none">
            <p className="m-0 px-2.5 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-muted">
              Move to sheet
            </p>
          </div>
          {render_move_to_sheet_items({
            other_sheets,
            is_pending,
            close_menu,
            on_move,
          })}
          {render_archive_item({
            is_pending,
            entry_is_archived,
            entry_is_active,
            close_menu,
            on_archive,
            on_unarchive,
          })}
          <div role="none">
            <hr
              className="my-1 border-0 border-t border-panel-border"
              aria-hidden="true"
            />
          </div>
          {render_delete_item(is_pending, close_menu, on_delete)}
        </div>
      ) : null}
    </div>
  );
}

function render_edit_times_item(
  is_pending: boolean,
  close_menu: () => void,
  on_edit: () => void,
) {
  return (
    <div role="none">
      <button
        type="button"
        className={menu_item_class}
        role="menuitem"
        disabled={is_pending}
        onClick={() => {
          close_menu();
          on_edit();
        }}
      >
        Edit times
      </button>
    </div>
  );
}

function render_add_note_item({
  is_pending,
  close_menu,
  on_show_add_note_form,
  on_add_note,
}: Readonly<{
  is_pending: boolean;
  close_menu: () => void;
  on_show_add_note_form?: () => void;
  on_add_note?: (text: string) => void;
}>) {
  if (on_show_add_note_form === undefined && on_add_note === undefined) {
    return null;
  }

  return (
    <div role="none">
      <button
        type="button"
        className={menu_item_class}
        role="menuitem"
        disabled={is_pending}
        onClick={() => {
          close_menu();

          if (on_show_add_note_form !== undefined) {
            on_show_add_note_form();
            return;
          }

          const text = prompt_entry_note();

          if (text !== null && on_add_note !== undefined) {
            on_add_note(text);
          }
        }}
      >
        Add note
      </button>
    </div>
  );
}

function render_revise_description_item({
  is_pending,
  can_revise_description_ai,
  close_menu,
  on_revise_description_ai,
}: Readonly<{
  is_pending: boolean;
  can_revise_description_ai: boolean;
  close_menu: () => void;
  on_revise_description_ai?: () => void;
}>) {
  if (on_revise_description_ai === undefined) {
    return null;
  }

  return (
    <div role="none">
      <button
        type="button"
        className={menu_item_class}
        role="menuitem"
        disabled={is_pending || !can_revise_description_ai}
        title={
          can_revise_description_ai
            ? "Revise with AI"
            : "Configure provider and key in Settings → AI suggestions"
        }
        onClick={() => {
          close_menu();
          on_revise_description_ai();
        }}
      >
        Revise description with AI
      </button>
    </div>
  );
}

function render_resume_item({
  is_pending,
  resume_blocked,
  resume_blocked_reason,
  close_menu,
  on_resume,
}: Readonly<{
  is_pending: boolean;
  resume_blocked: boolean;
  resume_blocked_reason: string;
  close_menu: () => void;
  on_resume?: () => void;
}>) {
  if (on_resume === undefined) {
    return null;
  }

  return (
    <div role="none">
      <button
        type="button"
        className={menu_item_class}
        role="menuitem"
        disabled={is_pending || resume_blocked}
        title={resume_blocked ? resume_blocked_reason : undefined}
        onClick={() => {
          close_menu();
          on_resume();
        }}
      >
        Resume
      </button>
    </div>
  );
}

function render_split_item({
  is_pending,
  can_split,
  close_menu,
  on_split,
}: Readonly<{
  is_pending: boolean;
  can_split: boolean;
  close_menu: () => void;
  on_split?: (at: string) => void;
}>) {
  if (on_split === undefined) {
    return null;
  }

  return (
    <div role="none">
      <button
        type="button"
        className={menu_item_class}
        role="menuitem"
        disabled={is_pending || !can_split}
        title={
          can_split
            ? "Split into two entries at a time"
            : "Only completed entries can be split"
        }
        onClick={() => {
          close_menu();

          if (!can_split) {
            return;
          }

          const at = prompt_split_entry_at();

          if (at !== null) {
            on_split(at);
          }
        }}
      >
        Split entry
      </button>
    </div>
  );
}

function render_merge_items({
  is_pending,
  can_merge_previous,
  can_merge_next,
  close_menu,
  on_merge,
}: Readonly<{
  is_pending: boolean;
  can_merge_previous: boolean;
  can_merge_next: boolean;
  close_menu: () => void;
  on_merge?: (direction: MergeEntryDirection) => void;
}>) {
  if (on_merge === undefined) {
    return null;
  }

  return (
    <>
      <div role="none">
        <button
          type="button"
          className={menu_item_class}
          role="menuitem"
          disabled={is_pending || !can_merge_previous}
          title={
            can_merge_previous
              ? "Merge with the previous entry"
              : "No touching previous entry"
          }
          onClick={() => {
            close_menu();

            if (can_merge_previous) {
              on_merge("previous");
            }
          }}
        >
          Merge with previous
        </button>
      </div>
      <div role="none">
        <button
          type="button"
          className={menu_item_class}
          role="menuitem"
          disabled={is_pending || !can_merge_next}
          title={
            can_merge_next
              ? "Merge with the next entry"
              : "No touching next entry"
          }
          onClick={() => {
            close_menu();

            if (can_merge_next) {
              on_merge("next");
            }
          }}
        >
          Merge with next
        </button>
      </div>
    </>
  );
}

function render_move_to_sheet_items({
  other_sheets,
  is_pending,
  close_menu,
  on_move,
}: Readonly<{
  other_sheets: SerializedSheet[];
  is_pending: boolean;
  close_menu: () => void;
  on_move: (target_sheet_name: string) => void;
}>) {
  if (other_sheets.length === 0) {
    return (
      <div role="none">
        <button
          type="button"
          className={menu_item_class}
          role="menuitem"
          disabled
        >
          No other sheets
        </button>
      </div>
    );
  }

  return other_sheets.map((sheet) => (
    <div key={sheet.name} role="none">
      <button
        type="button"
        className={`${menu_item_class} pl-4`}
        role="menuitem"
        disabled={is_pending || sheet.hasActiveEntry}
        title={
          sheet.hasActiveEntry
            ? "That sheet already has an active entry"
            : undefined
        }
        onClick={() => {
          close_menu();
          on_move(sheet.name);
        }}
      >
        {sheet.name}
      </button>
    </div>
  ));
}

function render_archive_item({
  is_pending,
  entry_is_archived,
  entry_is_active,
  close_menu,
  on_archive,
  on_unarchive,
}: Readonly<{
  is_pending: boolean;
  entry_is_archived: boolean;
  entry_is_active: boolean;
  close_menu: () => void;
  on_archive?: () => void;
  on_unarchive?: () => void;
}>) {
  if (entry_is_archived) {
    if (on_unarchive === undefined) {
      return null;
    }

    return (
      <div role="none">
        <button
          type="button"
          className={menu_item_class}
          role="menuitem"
          disabled={is_pending}
          onClick={() => {
            close_menu();
            on_unarchive();
          }}
        >
          Restore entry
        </button>
      </div>
    );
  }

  if (on_archive === undefined) {
    return null;
  }

  return (
    <div role="none">
      <button
        type="button"
        className={menu_item_class}
        role="menuitem"
        disabled={is_pending || entry_is_active}
        title={
          entry_is_active ? "Check out before archiving this entry" : undefined
        }
        onClick={() => {
          close_menu();
          on_archive();
        }}
      >
        Archive entry
      </button>
    </div>
  );
}

function render_delete_item(
  is_pending: boolean,
  close_menu: () => void,
  on_delete: () => void,
) {
  return (
    <div role="none">
      <button
        type="button"
        className={`${menu_item_class} text-danger`}
        role="menuitem"
        disabled={is_pending}
        onClick={() => {
          close_menu();
          on_delete();
        }}
      >
        Delete
      </button>
    </div>
  );
}

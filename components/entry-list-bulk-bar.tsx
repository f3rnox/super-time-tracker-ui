"use client";

import { useState } from "react";

import { Checkbox } from "@/components/checkbox";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { get_input_class_name } from "@/lib/get_input_class_name";
import {
  type SerializedEntry,
  type SerializedSheet,
} from "@/lib/types/tracker_state";

type EntryListBulkBarProps = Readonly<{
  selected_count: number;
  total_count: number;
  all_selected: boolean;
  some_selected: boolean;
  selected_entries: SerializedEntry[];
  sheets: SerializedSheet[];
  is_pending: boolean;
  on_toggle_all: () => void;
  on_move: (target_sheet_name: string) => void;
  on_delete: () => void;
  on_clear: () => void;
}>;

/**
 * Header takeover for bulk actions when entries are selected.
 */
export function EntryListBulkBar({
  selected_count,
  total_count,
  all_selected,
  some_selected,
  selected_entries,
  sheets,
  is_pending,
  on_toggle_all,
  on_move,
  on_delete,
  on_clear,
}: EntryListBulkBarProps) {
  const [targetSheetName, setTargetSheetName] = useState("");
  const has_active_selection = selected_entries.some((entry) => entry.isActive);
  const movable_sheets = sheets.filter((sheet) => {
    if (has_active_selection && sheet.hasActiveEntry) {
      return false;
    }

    return selected_entries.some((entry) => entry.sheetName !== sheet.name);
  });

  const handle_move = (): void => {
    const trimmed = targetSheetName.trim();

    if (trimmed.length === 0) {
      return;
    }

    on_move(trimmed);
    setTargetSheetName("");
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-accent-border bg-accent-soft px-3 py-2">
      <Checkbox
        className="shrink-0"
        checked={all_selected}
        indeterminate={some_selected}
        disabled={is_pending}
        aria_label={
          all_selected ? "Deselect all entries" : "Select all entries"
        }
        on_change={on_toggle_all}
      />
      <p className="m-0 shrink-0 text-[0.85rem] font-semibold">
        {selected_count}
        <span className="text-muted">{` of ${total_count} selected`}</span>
      </p>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <select
            className={`${get_input_class_name("compact")} min-w-32`}
            value={targetSheetName}
            disabled={is_pending || movable_sheets.length === 0}
            aria-label="Move to sheet"
            onChange={(event) => setTargetSheetName(event.target.value)}
          >
            <option value="">Move to…</option>
            {movable_sheets.map((sheet) => (
              <option key={sheet.name} value={sheet.name}>
                {sheet.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={get_button_class_name("ghost", "small")}
            disabled={
              is_pending ||
              targetSheetName.trim().length === 0 ||
              movable_sheets.length === 0
            }
            onClick={handle_move}
          >
            Move
          </button>
        </div>
        <button
          type="button"
          className={get_button_class_name("danger", "small")}
          disabled={is_pending}
          onClick={on_delete}
        >
          Delete
        </button>
        <button
          type="button"
          className={`${get_button_class_name("ghost", "small")} shrink-0`}
          disabled={is_pending}
          aria-label="Clear selection"
          title="Clear selection"
          onClick={on_clear}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

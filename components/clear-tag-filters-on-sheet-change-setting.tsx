"use client";

import { useSyncExternalStore } from "react";

import { clear_tag_filters_on_sheet_change_preference } from "@/lib/preferences/clear_tag_filters_on_sheet_change_preference";
import { persist_ui_preference } from "@/lib/persist_ui_preference";

const set_clear_tag_filters_on_sheet_change = (enabled: boolean): void => {
  persist_ui_preference(
    clear_tag_filters_on_sheet_change_preference,
    enabled ? "true" : "false",
  );
};

/**
 * Setting: reset tag filters when switching sheets.
 */
export function ClearTagFiltersOnSheetChangeSetting() {
  const value = useSyncExternalStore(
    clear_tag_filters_on_sheet_change_preference.subscribe,
    clear_tag_filters_on_sheet_change_preference.get_snapshot,
    clear_tag_filters_on_sheet_change_preference.get_server_snapshot,
  );

  return (
    <label
      aria-label="Clear tag filters on sheet change"
      className="flex w-full cursor-pointer items-center gap-2.5"
    >
      <input
        type="checkbox"
        className="shrink-0"
        checked={value === "true"}
        onChange={(event) =>
          set_clear_tag_filters_on_sheet_change(event.target.checked)
        }
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">
          Clear tag filters on sheet change
        </span>
        <span className="text-[0.8rem] leading-snug text-muted">
          Remove tag filters when you switch to another sheet.
        </span>
      </span>
    </label>
  );
}

"use client";

import { useSyncExternalStore } from "react";

import {
  get_compact_lists_server_snapshot,
  get_compact_lists_snapshot,
} from "@/lib/get_compact_lists_snapshot";
import { notify_settings_saved } from "@/lib/notify_settings_saved";
import { set_compact_lists } from "@/lib/set_compact_lists";
import { subscribe_compact_lists } from "@/lib/subscribe_compact_lists";

/**
 * Toggles denser entry list rows without rounded corners.
 */
export function CompactListsSetting() {
  const compact_lists = useSyncExternalStore(
    subscribe_compact_lists,
    get_compact_lists_snapshot,
    get_compact_lists_server_snapshot,
  );

  return (
    <label
      aria-label="Compact lists"
      className="flex w-full cursor-pointer items-center gap-2.5"
    >
      <input
        type="checkbox"
        className="shrink-0"
        checked={compact_lists}
        onChange={(event) => {
          set_compact_lists(event.target.checked);
          notify_settings_saved();
        }}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">Compact lists</span>
        <span className="text-[0.8rem] leading-snug text-muted">
          Flatter, tighter rows in the sheet entry list
        </span>
      </span>
    </label>
  );
}

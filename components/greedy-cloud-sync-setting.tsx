"use client";

import { useSyncExternalStore } from "react";

import { greedy_cloud_sync_preference } from "@/lib/preferences/greedy_cloud_sync_preference";
import { persist_ui_preference } from "@/lib/persist_ui_preference";

const set_greedy_cloud_sync = (enabled: boolean): void => {
  persist_ui_preference(
    greedy_cloud_sync_preference,
    enabled ? "true" : "false",
  );
};

/**
 * Toggles merge-on-navigation and push-after-every-change cloud sync behavior.
 */
export function GreedyCloudSyncSetting() {
  const value = useSyncExternalStore(
    greedy_cloud_sync_preference.subscribe,
    greedy_cloud_sync_preference.get_snapshot,
    greedy_cloud_sync_preference.get_server_snapshot,
  );
  const is_enabled = value === "true";

  return (
    <label
      aria-label="Greedy cloud sync"
      className="flex w-full cursor-pointer items-center gap-2.5"
    >
      <input
        type="checkbox"
        className="shrink-0"
        checked={is_enabled}
        onChange={(event) => set_greedy_cloud_sync(event.target.checked)}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold">Greedy cloud sync</span>
        <span className="text-[0.8rem] leading-snug text-muted">
          When on, merge with the cloud when you move between pages and after
          each change. When off, merge once per session and push only when
          entries, notes, or sheets change—not when switching sheets.
        </span>
      </span>
    </label>
  );
}

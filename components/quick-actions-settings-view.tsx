"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { Checkbox } from "@/components/checkbox";
import { SettingsPageLayout } from "@/components/settings-page-layout";
import { get_input_class_name } from "@/lib/get_input_class_name";
import { notify_settings_saved } from "@/lib/notify_settings_saved";
import { parse_topbar_quick_actions } from "@/lib/parse_topbar_quick_actions";
import { parse_tracker_shortcut_map } from "@/lib/parse_tracker_shortcut_map";
import { topbar_quick_actions_preference } from "@/lib/preferences/topbar_quick_actions_preference";
import { tracker_shortcut_map_preference } from "@/lib/preferences/tracker_shortcut_map_preference";
import {
  topbar_quick_action_ids,
  tracker_shortcut_action_ids,
  type TopbarQuickActionId,
  type TrackerShortcutActionId,
} from "@/lib/types/quick_actions";

const shortcut_action_labels: Record<TrackerShortcutActionId, string> = {
  help: "Show keyboard shortcuts",
  "check-in": "Check in",
  "check-out": "Check out",
  "edit-entry": "Edit active entry",
  "add-note": "Add note",
  pomodoro: "Open Pomodoro",
  "previous-sheet": "Previous sheet",
  "next-sheet": "Next sheet",
  "zen-mode": "Toggle Zen Mode focus engine",
};

const topbar_action_labels: Record<TopbarQuickActionId, string> = {
  today: "Today",
  search: "Search entries",
  sheets: "Sheets",
  reporting: "Reporting",
  pomodoro: "Pomodoro",
  "manage-tags": "Tag management",
  "sync-settings": "Sync settings",
};

const format_shortcut_label = (key: string): string =>
  key === "?" ? "?" : key.toUpperCase();

/**
 * Settings page for keyboard quick actions and topbar quick links.
 */
export function QuickActionsSettingsView() {
  const [is_client_ready, setIs_client_ready] = useState(false);
  const shortcut_map_json = useSyncExternalStore(
    tracker_shortcut_map_preference.subscribe,
    tracker_shortcut_map_preference.get_snapshot,
    tracker_shortcut_map_preference.get_server_snapshot,
  );
  const topbar_actions_json = useSyncExternalStore(
    topbar_quick_actions_preference.subscribe,
    topbar_quick_actions_preference.get_snapshot,
    topbar_quick_actions_preference.get_server_snapshot,
  );

  const shortcut_map = useMemo(
    () => parse_tracker_shortcut_map(shortcut_map_json),
    [shortcut_map_json],
  );
  const topbar_actions = useMemo(
    () => parse_topbar_quick_actions(topbar_actions_json),
    [topbar_actions_json],
  );
  const [draft_shortcuts, setDraft_shortcuts] = useState(shortcut_map);

  useEffect(() => {
    setIs_client_ready(true);
  }, []);

  useEffect(() => {
    setDraft_shortcuts(shortcut_map);
  }, [shortcut_map]);

  const duplicate_keys = useMemo(() => {
    const counts = new Map<string, number>();

    for (const action_id of tracker_shortcut_action_ids) {
      const key = shortcut_map[action_id];
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [shortcut_map]);

  const set_shortcut = (
    action_id: TrackerShortcutActionId,
    next_key: string,
  ): void => {
    const next_map = { ...shortcut_map, [action_id]: next_key };
    tracker_shortcut_map_preference.write(JSON.stringify(next_map));
    tracker_shortcut_map_preference.notify();
    notify_settings_saved("Quick actions updated");
  };

  const capture_shortcut_key = (
    action_id: TrackerShortcutActionId,
    event: ReactKeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      const next_key = draft_shortcuts[action_id];

      if (next_key.length === 1) {
        set_shortcut(action_id, next_key);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setDraft_shortcuts((current) => ({
        ...current,
        [action_id]: shortcut_map[action_id],
      }));
      return;
    }

    if (event.key.length !== 1) {
      return;
    }

    const candidate_key = event.key.toLowerCase();
    const is_valid = /^[a-z\[\]\?]$/.test(candidate_key);

    if (!is_valid) {
      return;
    }

    event.preventDefault();
    setDraft_shortcuts((current) => ({
      ...current,
      [action_id]: candidate_key,
    }));
  };

  const toggle_topbar_action = (action_id: TopbarQuickActionId): void => {
    const next_actions = topbar_actions.includes(action_id)
      ? topbar_actions.filter((item) => item !== action_id)
      : [...topbar_actions, action_id];

    topbar_quick_actions_preference.write(JSON.stringify(next_actions));
    topbar_quick_actions_preference.notify();
    notify_settings_saved("Topbar shortcuts updated");
  };

  if (!is_client_ready) {
    return (
      <SettingsPageLayout
        breadcrumb={{
          current: "Quick actions",
          parent: { label: "Settings", href: "/settings" },
        }}
        title="Quick actions config"
        description="Customize keyboard shortcuts and topbar shortcuts."
      >
        <p className="m-0 text-[0.85rem] text-muted">
          Loading quick action settings…
        </p>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      breadcrumb={{
        current: "Quick actions",
        parent: { label: "Settings", href: "/settings" },
      }}
      title="Quick actions config"
      description="Customize keyboard shortcuts and topbar shortcuts."
    >
      <div className="flex flex-col gap-2">
        <section className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <h2 className="m-0 text-[0.95rem] font-semibold">
            Keyboard shortcuts
          </h2>
          <p className="m-0 mt-1 text-[0.8rem] leading-snug text-muted">
            Choose one key per action. If a key is reused, only the first
            matching action will trigger.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {tracker_shortcut_action_ids.map((action_id) => {
              const value = shortcut_map[action_id];
              const draft_value = draft_shortcuts[action_id] ?? value;
              const is_duplicate = duplicate_keys.has(value);
              const has_unsaved_change = draft_value !== value;

              return (
                <div
                  key={action_id}
                  className="grid min-h-20 content-center grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-2 rounded-md border border-panel-border px-2.5 py-2"
                >
                  <span className="text-[0.86rem]">
                    {shortcut_action_labels[action_id]}
                  </span>
                  <input
                    type="text"
                    className={`${get_input_class_name("compact")} h-8 w-14 justify-self-end px-2 text-center`}
                    value={format_shortcut_label(draft_value)}
                    readOnly
                    onKeyDown={(event) =>
                      capture_shortcut_key(action_id, event)
                    }
                    onFocus={(event) => event.currentTarget.select()}
                    aria-label={`${shortcut_action_labels[action_id]} shortcut`}
                  />
                  <span
                    className={`col-span-2 text-[0.72rem] ${
                      is_duplicate
                        ? "text-danger"
                        : has_unsaved_change
                          ? "text-muted"
                          : "text-transparent"
                    }`}
                  >
                    {is_duplicate
                      ? "Duplicate"
                      : has_unsaved_change
                        ? "Press Enter to save"
                        : "Ready"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <h2 className="m-0 text-[0.95rem] font-semibold">Topbar shortcuts</h2>
          <p className="m-0 mt-1 text-[0.8rem] leading-snug text-muted">
            Show quick links in the topbar on larger screens.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {topbar_quick_action_ids.map((action_id) => (
              <Checkbox
                key={action_id}
                checked={topbar_actions.includes(action_id)}
                on_change={() => toggle_topbar_action(action_id)}
                label={topbar_action_labels[action_id]}
              />
            ))}
          </div>
        </section>
      </div>
    </SettingsPageLayout>
  );
}

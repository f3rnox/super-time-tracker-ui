"use client";

import { useSyncExternalStore } from "react";

import { today_scope_preference } from "@/lib/preferences/today_scope_preference";
import { set_today_focus_scope } from "@/lib/set_today_focus_scope";
import {
  get_pinned_sheet_names_server_snapshot,
  get_pinned_sheet_names_snapshot,
  subscribe_pinned_sheet_names,
} from "@/lib/pinned_sheet_names_store";
import { type TodayFocusScope } from "@/lib/types/today_focus_preferences";

interface TodayScopeControlsProps {
  sheet_names: string[];
  on_toggle_pin: (sheet_name: string) => void;
}

const scope_options: { value: TodayFocusScope; label: string }[] = [
  { value: "all", label: "All sheets" },
  { value: "pinned", label: "Pinned" },
];

/**
 * Scope toggle and pinned-sheet hints for the today view.
 */
export function TodayScopeControls({
  sheet_names,
  on_toggle_pin,
}: Readonly<TodayScopeControlsProps>) {
  const scope = useSyncExternalStore(
    today_scope_preference.subscribe,
    today_scope_preference.get_snapshot,
    today_scope_preference.get_server_snapshot,
  );
  const pinned_names = useSyncExternalStore(
    subscribe_pinned_sheet_names,
    get_pinned_sheet_names_snapshot,
    get_pinned_sheet_names_server_snapshot,
  );
  const pinned_set = new Set(pinned_names);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div
        role="group"
        aria-label="Today scope"
        className="flex flex-wrap gap-2"
      >
        {scope_options.map((option) => {
          const is_active = scope === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-[0.85rem] font-semibold transition-colors duration-150 ${
                is_active
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-panel-border bg-panel text-muted hover:border-accent hover:text-foreground"
              }`}
              aria-pressed={is_active}
              onClick={() => set_today_focus_scope(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {scope === "pinned" ? (
        <div className="flex flex-col gap-2">
          {pinned_names.length === 0 ? (
            <p className="m-0 text-[0.85rem] text-muted">
              Pin sheets from the Sheets page or below to filter today&apos;s
              view.
            </p>
          ) : null}
          <ul
            className="m-0 flex list-none flex-wrap gap-2 p-0"
            aria-label="Pinned sheets"
          >
            {sheet_names.map((sheet_name) => {
              const is_pinned = pinned_set.has(sheet_name);

              return (
                <li key={sheet_name}>
                  <button
                    type="button"
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-[0.8rem] font-medium transition-colors duration-150 ${
                      is_pinned
                        ? "border-accent bg-accent-soft text-foreground"
                        : "border-panel-border bg-surface-raised text-muted hover:text-foreground"
                    }`}
                    aria-pressed={is_pinned}
                    onClick={() => on_toggle_pin(sheet_name)}
                  >
                    {is_pinned ? "★ " : "☆ "}
                    {sheet_name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

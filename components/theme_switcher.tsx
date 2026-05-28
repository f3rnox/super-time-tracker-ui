"use client";

import { useSyncExternalStore } from "react";

import {
  get_theme_server_snapshot,
  get_theme_snapshot,
} from "@/lib/get_theme_snapshot";
import { subscribe_theme } from "@/lib/subscribe_theme";
import { toggle_theme } from "@/lib/toggle_theme";

/**
 * Toggles between light and dark themes.
 */
export function ThemeSwitcher() {
  const theme = useSyncExternalStore(
    subscribe_theme,
    get_theme_snapshot,
    get_theme_server_snapshot,
  );

  const active_label = theme === "dark" ? "Dark" : "Light";
  const switch_label =
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-panel-border bg-ghost-bg px-3 py-1.5 font-inherit text-[0.85rem] font-semibold text-inherit hover:bg-surface-hover disabled:cursor-wait disabled:opacity-60"
      onClick={toggle_theme}
      aria-label={`${active_label} theme. ${switch_label}`}
      title={switch_label}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>{active_label}</span>
      <span className="text-base leading-none" aria-hidden="true">
        {theme === "dark" ? "☾" : "☀"}
      </span>
    </button>
  );
}

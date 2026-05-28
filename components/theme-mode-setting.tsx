"use client";

import { useSyncExternalStore } from "react";

import { SettingRadioGroup } from "@/components/setting-radio-group";
import { theme_mode_preference } from "@/lib/preferences/theme_mode_preference";
import { notify_settings_saved } from "@/lib/notify_settings_saved";
import { set_theme_mode } from "@/lib/set_theme_mode";
import { type ThemeMode } from "@/lib/types/ui_preferences";

const options: { value: ThemeMode; label: string; description: string }[] = [
  {
    value: "light",
    label: "Light",
    description: "Always use the light theme.",
  },
  { value: "dark", label: "Dark", description: "Always use the dark theme." },
  {
    value: "system",
    label: "System",
    description: "Match the operating system preference.",
  },
];

/**
 * Setting: light / dark / system theme preference.
 */
export function ThemeModeSetting() {
  const mode = useSyncExternalStore(
    theme_mode_preference.subscribe,
    theme_mode_preference.get_snapshot,
    theme_mode_preference.get_server_snapshot,
  );

  return (
    <SettingRadioGroup<ThemeMode>
      name="theme-mode"
      legend="Light / dark mode"
      description="Choose light, dark, or match the system. The topbar toggle flips light and dark."
      value={mode}
      options={options}
      on_change={(mode) => {
        set_theme_mode(mode);
        notify_settings_saved();
      }}
    />
  );
}

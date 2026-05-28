"use client";

import { useSyncExternalStore } from "react";

import { SettingRadioGroup } from "@/components/setting-radio-group";
import { notify_settings_saved } from "@/lib/notify_settings_saved";
import { color_palette_preference } from "@/lib/preferences/color_palette_preference";
import { set_color_palette } from "@/lib/set_color_palette";
import { type ColorPalette } from "@/lib/types/ui_preferences";

const options: {
  value: ColorPalette;
  label: string;
  description: string;
}[] = [
  {
    value: "default",
    label: "Default",
    description: "Balanced blue-gray surfaces for light and dark.",
  },
  {
    value: "midnight",
    label: "Midnight",
    description: "Cooler, deeper backgrounds with crisp panels.",
  },
  {
    value: "warm",
    label: "Warm",
    description: "Stone and sepia tones, easy on the eyes.",
  },
  {
    value: "ocean",
    label: "Ocean",
    description: "Soft blue-tinted surfaces and shadows.",
  },
  {
    value: "forest",
    label: "Forest",
    description: "Muted green-gray backgrounds.",
  },
  {
    value: "contrast",
    label: "High contrast",
    description: "Stronger text and border contrast for readability.",
  },
  {
    value: "sunset",
    label: "Sunset",
    description: "Warm oranges and pinks fading into deep plum.",
  },
  {
    value: "lavender",
    label: "Lavender",
    description: "Soft violet surfaces with cool highlights.",
  },
  {
    value: "rose",
    label: "Rose",
    description: "Blush pinks with rosy accents.",
  },
  {
    value: "slate",
    label: "Slate",
    description: "Neutral cool grays without color tinting.",
  },
  {
    value: "nord",
    label: "Nord",
    description: "Frosty arctic blues inspired by Nord.",
  },
  {
    value: "dracula",
    label: "Dracula",
    description: "Purple and magenta accents on deep night.",
  },
];

/**
 * Setting: base color palette for light and dark themes.
 */
export function ColorPaletteSetting() {
  const value = useSyncExternalStore(
    color_palette_preference.subscribe,
    color_palette_preference.get_snapshot,
    color_palette_preference.get_server_snapshot,
  );

  return (
    <SettingRadioGroup<ColorPalette>
      name="color-palette"
      legend="Color palette"
      description="Backgrounds, surfaces, and highlight colors for light and dark mode."
      value={value}
      options={options}
      on_change={(palette) => {
        if (palette === value) {
          return;
        }

        set_color_palette(palette);
        notify_settings_saved();
      }}
    />
  );
}

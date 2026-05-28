"use client";

import { useSyncExternalStore } from "react";

import { SettingRadioGroup } from "@/components/setting-radio-group";
import { tag_filter_mode_preference } from "@/lib/preferences/tag_filter_mode_preference";
import { persist_ui_preference } from "@/lib/persist_ui_preference";
import { type TagFilterMode } from "@/lib/types/ui_preferences";

const options: { value: TagFilterMode; label: string; description: string }[] =
  [
    {
      value: "all",
      label: "Match all tags",
      description: "Entry must include every selected tag.",
    },
    {
      value: "any",
      label: "Match any tag",
      description: "Entry can include any one of the selected tags.",
    },
  ];

const set_tag_filter_mode = (value: TagFilterMode): void => {
  persist_ui_preference(tag_filter_mode_preference, value);
};

/**
 * Setting: how multiple tag filters are combined.
 */
export function TagFilterModeSetting() {
  const value = useSyncExternalStore(
    tag_filter_mode_preference.subscribe,
    tag_filter_mode_preference.get_snapshot,
    tag_filter_mode_preference.get_server_snapshot,
  );

  return (
    <SettingRadioGroup<TagFilterMode>
      name="tag-filter-mode"
      legend="Tag filter mode"
      description="How entries match when multiple tags are selected on a sheet."
      value={value}
      options={options}
      on_change={set_tag_filter_mode}
    />
  );
}

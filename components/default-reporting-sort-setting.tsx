"use client";

import { useSyncExternalStore } from "react";

import { SettingRadioGroup } from "@/components/setting-radio-group";
import { default_reporting_sort_preference } from "@/lib/preferences/default_reporting_sort_preference";
import { persist_ui_preference } from "@/lib/persist_ui_preference";
import { type DefaultReportingSort } from "@/lib/types/ui_preferences";

const options: {
  value: DefaultReportingSort;
  label: string;
  description?: string;
}[] = [
  { value: "duration", label: "Duration" },
  { value: "name", label: "Name" },
  { value: "entry_count", label: "Entries" },
  { value: "active_first", label: "Active first" },
];

const set_default_reporting_sort = (value: DefaultReportingSort): void => {
  persist_ui_preference(default_reporting_sort_preference, value);
};

/**
 * Setting: default sort order for the reporting view.
 */
export function DefaultReportingSortSetting() {
  const value = useSyncExternalStore(
    default_reporting_sort_preference.subscribe,
    default_reporting_sort_preference.get_snapshot,
    default_reporting_sort_preference.get_server_snapshot,
  );

  return (
    <SettingRadioGroup<DefaultReportingSort>
      name="default-reporting-sort"
      legend="Default reporting sort"
      description="The Reporting view opens with this sort selected."
      value={value}
      options={options}
      on_change={set_default_reporting_sort}
    />
  );
}

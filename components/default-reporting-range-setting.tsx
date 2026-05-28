"use client";

import { useSyncExternalStore } from "react";

import { SettingRadioGroup } from "@/components/setting-radio-group";
import { default_reporting_range_preference } from "@/lib/preferences/default_reporting_range_preference";
import { persist_ui_preference } from "@/lib/persist_ui_preference";
import { type DefaultReportingRange } from "@/lib/types/ui_preferences";

const options: {
  value: DefaultReportingRange;
  label: string;
  description: string;
}[] = [
  {
    value: "none",
    label: "All time",
    description: "Open with no date filter applied.",
  },
  {
    value: "today",
    label: "Today",
    description: "Pre-select today’s date range.",
  },
  {
    value: "week",
    label: "This week",
    description: "Pre-select the current week (respects week starts on).",
  },
];

const set_default_reporting_range = (value: DefaultReportingRange): void => {
  persist_ui_preference(default_reporting_range_preference, value);
};

/**
 * Setting: initial date range when opening reporting.
 */
export function DefaultReportingRangeSetting() {
  const value = useSyncExternalStore(
    default_reporting_range_preference.subscribe,
    default_reporting_range_preference.get_snapshot,
    default_reporting_range_preference.get_server_snapshot,
  );

  return (
    <SettingRadioGroup<DefaultReportingRange>
      name="default-reporting-range"
      legend="Default reporting range"
      description="Date filter applied when you open the Reporting page."
      value={value}
      options={options}
      on_change={set_default_reporting_range}
    />
  );
}

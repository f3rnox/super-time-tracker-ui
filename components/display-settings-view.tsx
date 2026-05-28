import { ColorPaletteSetting } from "@/components/color-palette-setting";
import { CheckInFormCollapsedSetting } from "@/components/check-in-form-collapsed-setting";
import { CompactListsSetting } from "@/components/compact-lists-setting";
import { DefaultReportingRangeSetting } from "@/components/default-reporting-range-setting";
import { DefaultReportingSortSetting } from "@/components/default-reporting-sort-setting";
import { DurationFormatSetting } from "@/components/duration-format-setting";
import { EntryListSortSetting } from "@/components/entry-list-sort-setting";
import { SettingsPageLayout } from "@/components/settings-page-layout";
import { TagFilterModeSetting } from "@/components/tag-filter-mode-setting";
import { ThemeModeSetting } from "@/components/theme-mode-setting";
import { TimeFormatSetting } from "@/components/time-format-setting";
import { TimerInTitleSetting } from "@/components/timer-in-title-setting";
import { TimerShowSecondsSetting } from "@/components/timer-show-seconds-setting";
import { WeekStartsOnSetting } from "@/components/week-starts-on-setting";

const setting_card_class =
  "rounded-md border border-panel-border bg-panel p-3.5 shadow-sm";

const setting_card_wide_class = `${setting_card_class} md:col-span-2`;

/**
 * Settings page: display, layout, and formatting preferences.
 */
export function DisplaySettingsView() {
  return (
    <SettingsPageLayout
      breadcrumb={{
        current: "Display & layout",
        parent: { label: "Settings", href: "/settings" },
      }}
      title="Display & layout"
      description="How things look across the tracker, reporting, and entry lists."
    >
      <ul
        className="m-0 grid w-full list-none grid-cols-1 gap-2 p-0 md:grid-cols-2"
        aria-label="Display settings"
      >
        <li className={setting_card_wide_class}>
          <ThemeModeSetting />
        </li>
        <li className={setting_card_wide_class}>
          <ColorPaletteSetting />
        </li>
        <li className={setting_card_wide_class}>
          <CompactListsSetting />
        </li>
        <li className={setting_card_wide_class}>
          <CheckInFormCollapsedSetting />
        </li>
        <li className={setting_card_wide_class}>
          <TimeFormatSetting />
        </li>
        <li className={setting_card_wide_class}>
          <DurationFormatSetting />
        </li>
        <li className={setting_card_class}>
          <TimerShowSecondsSetting />
        </li>
        <li className={setting_card_class}>
          <TimerInTitleSetting />
        </li>
        <li className={setting_card_wide_class}>
          <EntryListSortSetting />
        </li>
        <li className={setting_card_class}>
          <TagFilterModeSetting />
        </li>
        <li className={setting_card_class}>
          <WeekStartsOnSetting />
        </li>
        <li className={setting_card_wide_class}>
          <DefaultReportingSortSetting />
        </li>
        <li className={setting_card_wide_class}>
          <DefaultReportingRangeSetting />
        </li>
      </ul>
    </SettingsPageLayout>
  );
}

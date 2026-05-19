export type ThemeMode = 'light' | 'dark' | 'system'
export const THEME_MODE_STORAGE_KEY = 'super-time-tracker-theme-mode'
export const THEME_MODE_DEFAULT: ThemeMode = 'system'

export type ColorPalette =
  | 'default'
  | 'midnight'
  | 'warm'
  | 'ocean'
  | 'forest'
  | 'contrast'
export const COLOR_PALETTE_STORAGE_KEY = 'super-time-tracker-color-palette'
export const COLOR_PALETTE_DEFAULT: ColorPalette = 'default'
export const COLOR_PALETTE_VALUES: ColorPalette[] = [
  'default',
  'midnight',
  'warm',
  'ocean',
  'forest',
  'contrast',
]

export type TimeFormat = '12h' | '24h'
export const TIME_FORMAT_STORAGE_KEY = 'super-time-tracker-time-format'
export const TIME_FORMAT_DEFAULT: TimeFormat = '12h'

export type DurationFormat = 'humanized' | 'clock' | 'decimal'
export const DURATION_FORMAT_STORAGE_KEY = 'super-time-tracker-duration-format'
export const DURATION_FORMAT_DEFAULT: DurationFormat = 'humanized'

export type WeekStartsOn = 'monday' | 'sunday'
export const WEEK_STARTS_ON_STORAGE_KEY = 'super-time-tracker-week-starts-on'
export const WEEK_STARTS_ON_DEFAULT: WeekStartsOn = 'monday'

export type DefaultReportingSort =
  | 'duration'
  | 'name'
  | 'entry_count'
  | 'active_first'
export const DEFAULT_REPORTING_SORT_STORAGE_KEY =
  'super-time-tracker-default-reporting-sort'
export const DEFAULT_REPORTING_SORT_DEFAULT: DefaultReportingSort = 'duration'

export type CheckInFormCollapsed = 'true' | 'false'
export const CHECK_IN_FORM_COLLAPSED_STORAGE_KEY =
  'super-time-tracker-check-in-form-collapsed'
export const CHECK_IN_FORM_COLLAPSED_DEFAULT: CheckInFormCollapsed = 'false'

export type ConfirmBeforeCheckout = 'true' | 'false'
export const CONFIRM_BEFORE_CHECKOUT_STORAGE_KEY =
  'super-time-tracker-confirm-before-checkout'
export const CONFIRM_BEFORE_CHECKOUT_DEFAULT: ConfirmBeforeCheckout = 'false'

export type ConfirmDestructiveActions = 'true' | 'false'
export const CONFIRM_DESTRUCTIVE_ACTIONS_STORAGE_KEY =
  'super-time-tracker-confirm-destructive-actions'
export const CONFIRM_DESTRUCTIVE_ACTIONS_DEFAULT: ConfirmDestructiveActions =
  'true'

export type AccentColor =
  | 'teal'
  | 'blue'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'emerald'
export const ACCENT_COLOR_STORAGE_KEY = 'super-time-tracker-accent-color'
export const ACCENT_COLOR_DEFAULT: AccentColor = 'teal'
export const ACCENT_COLOR_VALUES: AccentColor[] = [
  'teal',
  'blue',
  'violet',
  'rose',
  'amber',
  'emerald',
]

export type TimerShowSeconds = 'true' | 'false'
export const TIMER_SHOW_SECONDS_STORAGE_KEY =
  'super-time-tracker-timer-show-seconds'
export const TIMER_SHOW_SECONDS_DEFAULT: TimerShowSeconds = 'false'

export type TimerInTitle = 'true' | 'false'
export const TIMER_IN_TITLE_STORAGE_KEY = 'super-time-tracker-timer-in-title'
export const TIMER_IN_TITLE_DEFAULT: TimerInTitle = 'true'

export type TagFilterMode = 'all' | 'any'
export const TAG_FILTER_MODE_STORAGE_KEY = 'super-time-tracker-tag-filter-mode'
export const TAG_FILTER_MODE_DEFAULT: TagFilterMode = 'all'

export type EntryListSort = 'newest' | 'oldest' | 'duration' | 'description'
export const ENTRY_LIST_SORT_STORAGE_KEY = 'super-time-tracker-entry-list-sort'
export const ENTRY_LIST_SORT_DEFAULT: EntryListSort = 'newest'

export type DefaultReportingRange = 'none' | 'today' | 'week'
export const DEFAULT_REPORTING_RANGE_STORAGE_KEY =
  'super-time-tracker-default-reporting-range'
export const DEFAULT_REPORTING_RANGE_DEFAULT: DefaultReportingRange = 'none'

export type ClearTagFiltersOnSheetChange = 'true' | 'false'
export const CLEAR_TAG_FILTERS_ON_SHEET_CHANGE_STORAGE_KEY =
  'super-time-tracker-clear-tag-filters-on-sheet-change'
export const CLEAR_TAG_FILTERS_ON_SHEET_CHANGE_DEFAULT: ClearTagFiltersOnSheetChange =
  'false'

export type GreedyCloudSync = 'true' | 'false'
export const GREEDY_CLOUD_SYNC_STORAGE_KEY =
  'super-time-tracker-greedy-cloud-sync'
export const GREEDY_CLOUD_SYNC_DEFAULT: GreedyCloudSync = 'true'

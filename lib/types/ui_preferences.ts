export type ThemeMode = 'light' | 'dark' | 'system'
export const THEME_MODE_STORAGE_KEY = 'super-time-tracker-theme-mode'
export const THEME_MODE_DEFAULT: ThemeMode = 'system'

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

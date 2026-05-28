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
  | 'sunset'
  | 'lavender'
  | 'rose'
  | 'slate'
  | 'nord'
  | 'dracula'
export const COLOR_PALETTE_STORAGE_KEY = 'super-time-tracker-color-palette'
export const COLOR_PALETTE_DEFAULT: ColorPalette = 'default'
export const COLOR_PALETTE_VALUES: ColorPalette[] = [
  'default',
  'midnight',
  'warm',
  'ocean',
  'forest',
  'contrast',
  'sunset',
  'lavender',
  'rose',
  'slate',
  'nord',
  'dracula',
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

export type DesktopNotifications = 'true' | 'false'
export const DESKTOP_NOTIFICATIONS_STORAGE_KEY =
  'super-time-tracker-desktop-notifications'
export const DESKTOP_NOTIFICATIONS_DEFAULT: DesktopNotifications = 'false'

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

export type DebugLogging = 'true' | 'false'
export const DEBUG_LOGGING_STORAGE_KEY = 'super-time-tracker-debug-logging'
export const DEBUG_LOGGING_DEFAULT: DebugLogging = 'false'

export type GreedyCloudSync = 'true' | 'false'
export const GREEDY_CLOUD_SYNC_STORAGE_KEY =
  'super-time-tracker-greedy-cloud-sync'
export const GREEDY_CLOUD_SYNC_DEFAULT: GreedyCloudSync = 'true'

export type CloudSyncEnabled = 'true' | 'false'
export const CLOUD_SYNC_ENABLED_STORAGE_KEY = 'super-time-tracker-cloud-sync-enabled'
export const CLOUD_SYNC_ENABLED_DEFAULT: CloudSyncEnabled = 'true'

export type FocusNudgesEnabled = 'true' | 'false'
export const FOCUS_NUDGES_ENABLED_STORAGE_KEY =
  'super-time-tracker-focus-nudges-enabled'
export const FOCUS_NUDGES_ENABLED_DEFAULT: FocusNudgesEnabled = 'true'

export type DailyFocusTargetMinutes = string
export const DAILY_FOCUS_TARGET_MINUTES_STORAGE_KEY =
  'super-time-tracker-daily-focus-target-minutes'
export const DAILY_FOCUS_TARGET_MINUTES_DEFAULT: DailyFocusTargetMinutes = '240'

export type WeeklyFocusTargetMinutes = string
export const WEEKLY_FOCUS_TARGET_MINUTES_STORAGE_KEY =
  'super-time-tracker-weekly-focus-target-minutes'
export const WEEKLY_FOCUS_TARGET_MINUTES_DEFAULT: WeeklyFocusTargetMinutes = '1200'

export type OverworkAlertHours = string
export const OVERWORK_ALERT_HOURS_STORAGE_KEY =
  'super-time-tracker-overwork-alert-hours'
export const OVERWORK_ALERT_HOURS_DEFAULT: OverworkAlertHours = '8'

export type NoLogReminderMinutes = string
export const NO_LOG_REMINDER_MINUTES_STORAGE_KEY =
  'super-time-tracker-no-log-reminder-minutes'
export const NO_LOG_REMINDER_MINUTES_DEFAULT: NoLogReminderMinutes = '45'

export type WorkHoursStart = string
export const WORK_HOURS_START_STORAGE_KEY = 'super-time-tracker-work-hours-start'
export const WORK_HOURS_START_DEFAULT: WorkHoursStart = '09:00'

export type WorkHoursEnd = string
export const WORK_HOURS_END_STORAGE_KEY = 'super-time-tracker-work-hours-end'
export const WORK_HOURS_END_DEFAULT: WorkHoursEnd = '17:00'

export type FocusGoalScope = 'global' | 'sheet' | 'tag'
export const FOCUS_GOAL_SCOPE_STORAGE_KEY = 'super-time-tracker-focus-goal-scope'
export const FOCUS_GOAL_SCOPE_DEFAULT: FocusGoalScope = 'global'

export type FocusGoalSheetName = string
export const FOCUS_GOAL_SHEET_NAME_STORAGE_KEY =
  'super-time-tracker-focus-goal-sheet-name'
export const FOCUS_GOAL_SHEET_NAME_DEFAULT: FocusGoalSheetName = ''

export type FocusGoalTagName = string
export const FOCUS_GOAL_TAG_NAME_STORAGE_KEY = 'super-time-tracker-focus-goal-tag-name'
export const FOCUS_GOAL_TAG_NAME_DEFAULT: FocusGoalTagName = ''

export type FocusGoalsPerSheetJson = string
export const FOCUS_GOALS_PER_SHEET_STORAGE_KEY =
  'super-time-tracker-focus-goals-per-sheet'
export const FOCUS_GOALS_PER_SHEET_DEFAULT: FocusGoalsPerSheetJson = '{}'

export type FocusGoalsPerTagJson = string
export const FOCUS_GOALS_PER_TAG_STORAGE_KEY =
  'super-time-tracker-focus-goals-per-tag'
export const FOCUS_GOALS_PER_TAG_DEFAULT: FocusGoalsPerTagJson = '{}'

export type EntrySuggestionProvider = 'none' | 'openai' | 'claude' | 'google_ai'
export const ENTRY_SUGGESTION_PROVIDER_STORAGE_KEY =
  'super-time-tracker-entry-suggestion-provider'
export const ENTRY_SUGGESTION_PROVIDER_DEFAULT: EntrySuggestionProvider = 'none'

export type OpenAiApiKey = string
export const OPENAI_API_KEY_STORAGE_KEY = 'super-time-tracker-openai-api-key'
export const OPENAI_API_KEY_DEFAULT: OpenAiApiKey = ''

export type ClaudeApiKey = string
export const CLAUDE_API_KEY_STORAGE_KEY = 'super-time-tracker-claude-api-key'
export const CLAUDE_API_KEY_DEFAULT: ClaudeApiKey = ''

export type GoogleAiApiKey = string
export const GOOGLE_AI_API_KEY_STORAGE_KEY = 'super-time-tracker-google-ai-api-key'
export const GOOGLE_AI_API_KEY_DEFAULT: GoogleAiApiKey = ''

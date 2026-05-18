export const COMPACT_LISTS_STORAGE_KEY = 'super-time-tracker-compact-lists'
export const SHEET_TAG_FILTERS_STORAGE_KEY = 'super-time-tracker-sheet-tag-filters'
export const ACTIVE_SHEET_STORAGE_KEY = 'super-time-tracker-active-sheet'
export const ACTIVE_SHEET_COOKIE_NAME = 'stt-active-sheet'

export type DefaultSheetSessionMode = 'last_viewed' | 'active_timer' | 'fixed'

export const DEFAULT_SHEET_SESSION_MODE_STORAGE_KEY =
  'super-time-tracker-default-sheet-session-mode'
export const DEFAULT_SHEET_SESSION_MODE_COOKIE_NAME = 'stt-default-sheet-session-mode'

export const DEFAULT_SHEET_FIXED_NAME_STORAGE_KEY =
  'super-time-tracker-default-sheet-fixed-name'
export const DEFAULT_SHEET_FIXED_NAME_COOKIE_NAME = 'stt-default-sheet-fixed-name'

export const DEFAULT_SHEET_SESSION_MODE_DEFAULT: DefaultSheetSessionMode =
  'last_viewed'
import { type ReportingDateRangeShortcut } from '@/lib/types/reporting'

const reporting_range_shortcuts: ReportingDateRangeShortcut[] = [
  'today',
  'yesterday',
  'week',
  'month',
  'last_month',
  'year',
  'last_year',
]

/**
 * Parses a reporting range shortcut from URL search params.
 */
export function parse_reporting_range_from_search_params(
  range: string | null,
): ReportingDateRangeShortcut | null {
  if (range === null) {
    return null
  }

  const normalized = range.trim().toLowerCase()

  return reporting_range_shortcuts.includes(
    normalized as ReportingDateRangeShortcut,
  )
    ? (normalized as ReportingDateRangeShortcut)
    : null
}

import { get_reporting_date_range_shortcut_inputs } from '@/lib/get_reporting_date_range_shortcut_inputs'
import {
  type ReportingDateRangeInputs,
  type ReportingDateRangeShortcut,
} from '@/lib/types/reporting'

/**
 * Returns whether the given range matches a reporting shortcut for the reference date.
 */
export function matches_reporting_date_range_shortcut(
  range: ReportingDateRangeInputs,
  shortcut: ReportingDateRangeShortcut,
  reference: Date = new Date(),
  week_starts_on: 0 | 1 = 1,
): boolean {
  if (range.from_date.length === 0 || range.to_date.length === 0) {
    return false
  }

  const shortcut_range = get_reporting_date_range_shortcut_inputs(
    shortcut,
    reference,
    week_starts_on,
  )

  return (
    range.from_date === shortcut_range.from_date &&
    range.to_date === shortcut_range.to_date
  )
}

import { default_reporting_range_preference } from '@/lib/preferences/default_reporting_range_preference'
import { get_reporting_date_range_shortcut_inputs } from '@/lib/get_reporting_date_range_shortcut_inputs'
import {
  type DefaultReportingRange,
  type WeekStartsOn,
} from '@/lib/types/ui_preferences'
import { type ReportingDateRangeInputs } from '@/lib/types/reporting'
import { week_starts_on_to_index } from '@/lib/week_starts_on_to_index'

const empty_range: ReportingDateRangeInputs = {
  from_date: '',
  to_date: '',
}

/**
 * Returns the initial reporting date range from the user's preference.
 */
export function get_initial_reporting_range_inputs(
  range: DefaultReportingRange = default_reporting_range_preference.read(),
  week_starts_on: WeekStartsOn = 'monday',
): ReportingDateRangeInputs {
  if (range === 'none') {
    return empty_range
  }

  return get_reporting_date_range_shortcut_inputs(
    range,
    new Date(),
    week_starts_on_to_index(week_starts_on),
  )
}

import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  DEFAULT_REPORTING_SORT_DEFAULT,
  DEFAULT_REPORTING_SORT_STORAGE_KEY,
  type DefaultReportingSort,
} from '@/lib/types/ui_preferences'

const is_default_reporting_sort = (
  value: string,
): value is DefaultReportingSort =>
  value === 'duration' ||
  value === 'name' ||
  value === 'entry_count' ||
  value === 'active_first'

/**
 * Default reporting sort preference store.
 */
export const default_reporting_sort_preference =
  create_ui_preference_store<DefaultReportingSort>({
    storage_key: DEFAULT_REPORTING_SORT_STORAGE_KEY,
    default_value: DEFAULT_REPORTING_SORT_DEFAULT,
    is_valid: is_default_reporting_sort,
  })

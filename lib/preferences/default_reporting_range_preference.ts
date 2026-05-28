import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  DEFAULT_REPORTING_RANGE_DEFAULT,
  DEFAULT_REPORTING_RANGE_STORAGE_KEY,
  type DefaultReportingRange,
} from "@/lib/types/ui_preferences";

const is_default_reporting_range = (
  value: string,
): value is DefaultReportingRange =>
  value === "none" || value === "today" || value === "week";

/**
 * Initial date range when opening the reporting view.
 */
export const default_reporting_range_preference =
  create_ui_preference_store<DefaultReportingRange>({
    storage_key: DEFAULT_REPORTING_RANGE_STORAGE_KEY,
    default_value: DEFAULT_REPORTING_RANGE_DEFAULT,
    is_valid: is_default_reporting_range,
  });

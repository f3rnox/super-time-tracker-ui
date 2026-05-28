import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

import {
  type ReportingDateRangeInputs,
  type ReportingDateRangeShortcut,
} from "@/lib/types/reporting";

/**
 * Returns date input values for a reporting range shortcut.
 */
export function get_reporting_date_range_shortcut_inputs(
  shortcut: ReportingDateRangeShortcut,
  reference: Date = new Date(),
  week_starts_on: 0 | 1 = 1,
): ReportingDateRangeInputs {
  const format_input_date = (date: Date): string => format(date, "yyyy-MM-dd");

  switch (shortcut) {
    case "yesterday": {
      const day = subDays(reference, 1);

      return {
        from_date: format_input_date(startOfDay(day)),
        to_date: format_input_date(startOfDay(day)),
      };
    }
    case "week":
      return {
        from_date: format_input_date(
          startOfWeek(reference, { weekStartsOn: week_starts_on }),
        ),
        to_date: format_input_date(
          endOfWeek(reference, { weekStartsOn: week_starts_on }),
        ),
      };
    case "month":
      return {
        from_date: format_input_date(startOfMonth(reference)),
        to_date: format_input_date(endOfMonth(reference)),
      };
    case "last_month": {
      const last_month = subMonths(reference, 1);

      return {
        from_date: format_input_date(startOfMonth(last_month)),
        to_date: format_input_date(endOfMonth(last_month)),
      };
    }
    case "year":
      return {
        from_date: format_input_date(startOfYear(reference)),
        to_date: format_input_date(endOfYear(reference)),
      };
    case "last_year": {
      const last_year = subYears(reference, 1);

      return {
        from_date: format_input_date(startOfYear(last_year)),
        to_date: format_input_date(endOfYear(last_year)),
      };
    }
    case "today":
    default: {
      const day = startOfDay(reference);

      return {
        from_date: format_input_date(day),
        to_date: format_input_date(day),
      };
    }
  }
}

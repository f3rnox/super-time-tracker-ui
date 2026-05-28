import { type ReportingDateRangeShortcut } from '@/lib/types/reporting'

/**
 * Returns a reporting page href for a date-range shortcut.
 */
export function build_command_palette_reporting_href(
  shortcut: ReportingDateRangeShortcut,
): string {
  return `/reporting?range=${encodeURIComponent(shortcut)}`
}

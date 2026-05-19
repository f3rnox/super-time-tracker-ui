import { formatDistanceToNowStrict } from 'date-fns'

/**
 * Formats a last-activity timestamp as a short relative label.
 */
export function format_last_activity_label(
  iso_timestamp: string | null,
  now: number = Date.now(),
): string {
  if (iso_timestamp === null) {
    return 'No activity'
  }

  const activity_at = new Date(iso_timestamp)

  if (Number.isNaN(+activity_at)) {
    return 'No activity'
  }

  return formatDistanceToNowStrict(activity_at, {
    addSuffix: true,
    roundingMethod: 'floor',
  })
}

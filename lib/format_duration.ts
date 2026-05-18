import humanizeDuration from 'humanize-duration'

import { type DurationFormat } from '@/lib/types/ui_preferences'

const pad = (value: number): string => value.toString().padStart(2, '0')

const format_clock = (duration_ms: number): string => {
  const sign = duration_ms < 0 ? '-' : ''
  const total_seconds = Math.round(Math.abs(duration_ms) / 1000)
  const hours = Math.floor(total_seconds / 3600)
  const minutes = Math.floor((total_seconds % 3600) / 60)
  const seconds = total_seconds % 60

  return `${sign}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

const format_decimal = (duration_ms: number): string => {
  const hours = duration_ms / 3_600_000

  return `${hours.toFixed(2)}h`
}

/**
 * Formats a duration in milliseconds using the preferred format.
 */
export function format_duration(
  duration_ms: number,
  duration_format: DurationFormat = 'humanized',
): string {
  if (duration_format === 'clock') {
    return format_clock(duration_ms)
  }

  if (duration_format === 'decimal') {
    return format_decimal(duration_ms)
  }

  return humanizeDuration(duration_ms, {
    largest: 2,
    round: true,
    spacer: ' ',
    delimiter: ' ',
  })
}

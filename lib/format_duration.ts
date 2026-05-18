import humanizeDuration from "humanize-duration";

/**
 * Formats a duration in milliseconds for display.
 */
export function format_duration(duration_ms: number): string {
  return humanizeDuration(duration_ms, {
    largest: 2,
    round: true,
    spacer: " ",
    delimiter: " ",
  });
}

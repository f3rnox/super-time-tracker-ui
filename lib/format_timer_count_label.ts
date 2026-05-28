/**
 * Formats a running-timer count for the today focus view.
 */
export function format_timer_count_label(count: number): string {
  if (count === 0) {
    return "No active timers";
  }

  if (count === 1) {
    return "1 timer";
  }

  return `${count} timers`;
}

/**
 * Returns focus goal progress as a percentage capped at 100.
 */
export function get_focus_goal_progress_percent(
  tracked_ms: number,
  target_ms: number,
): number {
  if (target_ms <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((tracked_ms / target_ms) * 100));
}

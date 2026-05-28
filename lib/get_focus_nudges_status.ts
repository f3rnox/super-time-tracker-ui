import { entry_matches_focus_goal_scope } from "@/lib/entry_matches_focus_goal_scope";
import { get_clipped_entry_duration_ms } from "@/lib/get_clipped_entry_duration_ms";
import { get_period_range_ms } from "@/lib/get_period_range_ms";
import { read_db } from "@/lib/read_db";
import { update_focus_nudges_entry_aggregates } from "@/lib/update_focus_nudges_entry_aggregates";
import { type TimeTrackerDB } from "@/lib/types";
import { type FocusGoalScope } from "@/lib/types/ui_preferences";
import { type FocusNudgesStatus } from "@/lib/types/focus_nudges_status";

interface FocusNudgesStatusArgs {
  scope?: FocusGoalScope;
  sheet_name?: string;
  tag_name?: string;
  db?: TimeTrackerDB;
}

/**
 * Builds the current status used for focus goals and reminder nudges.
 */
export async function get_focus_nudges_status({
  scope = "global",
  sheet_name,
  tag_name,
  db: provided_db,
}: FocusNudgesStatusArgs = {}): Promise<FocusNudgesStatus> {
  const db = provided_db ?? (await read_db());
  const now_ms = Date.now();
  const reference = new Date(now_ms);
  const today_range = get_period_range_ms("today", reference);
  const week_range = get_period_range_ms("week", reference);

  let today_tracked_ms = 0;
  let week_tracked_ms = 0;
  let aggregates = {
    last_log_ms: null as number | null,
    active_timer_duration_ms: null as number | null,
  };

  for (const sheet of db.sheets) {
    for (const entry of sheet.entries) {
      if (
        entry_matches_focus_goal_scope({
          scope,
          sheet_name,
          tag_name,
          sheet_name_on_entry: sheet.name,
          entry,
        })
      ) {
        today_tracked_ms += get_clipped_entry_duration_ms(
          entry,
          today_range.startMs,
          today_range.endMs,
          now_ms,
        );
        week_tracked_ms += get_clipped_entry_duration_ms(
          entry,
          week_range.startMs,
          week_range.endMs,
          now_ms,
        );
      }

      aggregates = update_focus_nudges_entry_aggregates(
        entry,
        now_ms,
        aggregates,
      );
    }
  }

  const minutes_since_last_log =
    aggregates.active_timer_duration_ms !== null ||
    aggregates.last_log_ms === null
      ? null
      : Math.floor((now_ms - aggregates.last_log_ms) / 60000);

  return {
    todayTrackedMs: today_tracked_ms,
    weekTrackedMs: week_tracked_ms,
    activeTimerDurationMs: aggregates.active_timer_duration_ms,
    minutesSinceLastLog: minutes_since_last_log,
  };
}

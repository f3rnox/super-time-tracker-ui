import { today_scope_preference } from "@/lib/preferences/today_scope_preference";
import { type TodayFocusScope } from "@/lib/types/today_focus_preferences";

/**
 * Persists the today view sheet scope and notifies subscribers.
 */
export function set_today_focus_scope(scope: TodayFocusScope): void {
  if (today_scope_preference.read() === scope) {
    return;
  }

  today_scope_preference.write(scope);
  today_scope_preference.notify();
}

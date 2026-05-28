import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  OVERWORK_ALERT_HOURS_DEFAULT,
  OVERWORK_ALERT_HOURS_STORAGE_KEY,
  type OverworkAlertHours,
} from "@/lib/types/ui_preferences";

const is_overwork_alert_hours = (
  value: string,
): value is OverworkAlertHours => {
  if (!/^\d+$/.test(value)) {
    return false;
  }

  const hours = Number.parseInt(value, 10);
  return hours >= 1 && hours <= 16;
};

/**
 * Alert threshold for long uninterrupted tracking sessions.
 */
export const overwork_alert_hours_preference =
  create_ui_preference_store<OverworkAlertHours>({
    storage_key: OVERWORK_ALERT_HOURS_STORAGE_KEY,
    default_value: OVERWORK_ALERT_HOURS_DEFAULT,
    is_valid: is_overwork_alert_hours,
  });

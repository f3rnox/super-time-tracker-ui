import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  DESKTOP_NOTIFICATIONS_DEFAULT,
  DESKTOP_NOTIFICATIONS_STORAGE_KEY,
  type DesktopNotifications,
} from "@/lib/types/ui_preferences";

const is_desktop_notifications = (
  value: string,
): value is DesktopNotifications => value === "true" || value === "false";

/**
 * Whether browser desktop notifications are enabled for tracker events.
 */
export const desktop_notifications_preference =
  create_ui_preference_store<DesktopNotifications>({
    storage_key: DESKTOP_NOTIFICATIONS_STORAGE_KEY,
    default_value: DESKTOP_NOTIFICATIONS_DEFAULT,
    is_valid: is_desktop_notifications,
  });

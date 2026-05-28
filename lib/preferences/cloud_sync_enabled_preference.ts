import { create_ui_preference_store } from "@/lib/ui_preference_store";
import {
  CLOUD_SYNC_ENABLED_DEFAULT,
  CLOUD_SYNC_ENABLED_STORAGE_KEY,
  type CloudSyncEnabled,
} from "@/lib/types/ui_preferences";

const is_cloud_sync_enabled = (value: string): value is CloudSyncEnabled =>
  value === "true" || value === "false";

/**
 * Whether cloud sync operations are currently enabled.
 */
export const cloud_sync_enabled_preference =
  create_ui_preference_store<CloudSyncEnabled>({
    storage_key: CLOUD_SYNC_ENABLED_STORAGE_KEY,
    default_value: CLOUD_SYNC_ENABLED_DEFAULT,
    is_valid: is_cloud_sync_enabled,
  });

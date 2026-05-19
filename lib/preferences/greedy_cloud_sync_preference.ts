import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  GREEDY_CLOUD_SYNC_DEFAULT,
  GREEDY_CLOUD_SYNC_STORAGE_KEY,
  type GreedyCloudSync,
} from '@/lib/types/ui_preferences'

const is_greedy_cloud_sync = (value: string): value is GreedyCloudSync =>
  value === 'true' || value === 'false'

/**
 * Whether to sync the tracker database on navigation and after every change.
 */
export const greedy_cloud_sync_preference = create_ui_preference_store<GreedyCloudSync>({
  storage_key: GREEDY_CLOUD_SYNC_STORAGE_KEY,
  default_value: GREEDY_CLOUD_SYNC_DEFAULT,
  is_valid: is_greedy_cloud_sync,
})

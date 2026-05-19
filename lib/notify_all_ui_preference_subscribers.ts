import { accent_color_preference } from '@/lib/preferences/accent_color_preference'
import { check_in_form_collapsed_preference } from '@/lib/preferences/check_in_form_collapsed_preference'
import { clear_tag_filters_on_sheet_change_preference } from '@/lib/preferences/clear_tag_filters_on_sheet_change_preference'
import { color_palette_preference } from '@/lib/preferences/color_palette_preference'
import { confirm_before_checkout_preference } from '@/lib/preferences/confirm_before_checkout_preference'
import { confirm_destructive_actions_preference } from '@/lib/preferences/confirm_destructive_actions_preference'
import { default_reporting_range_preference } from '@/lib/preferences/default_reporting_range_preference'
import { default_reporting_sort_preference } from '@/lib/preferences/default_reporting_sort_preference'
import { duration_format_preference } from '@/lib/preferences/duration_format_preference'
import { entry_list_sort_preference } from '@/lib/preferences/entry_list_sort_preference'
import { greedy_cloud_sync_preference } from '@/lib/preferences/greedy_cloud_sync_preference'
import { tag_filter_mode_preference } from '@/lib/preferences/tag_filter_mode_preference'
import { today_scope_preference } from '@/lib/preferences/today_scope_preference'
import { theme_mode_preference } from '@/lib/preferences/theme_mode_preference'
import { time_format_preference } from '@/lib/preferences/time_format_preference'
import { timer_in_title_preference } from '@/lib/preferences/timer_in_title_preference'
import { timer_show_seconds_preference } from '@/lib/preferences/timer_show_seconds_preference'
import { week_starts_on_preference } from '@/lib/preferences/week_starts_on_preference'
import { notify_compact_lists_subscribers } from '@/lib/subscribe_compact_lists'
import { notify_sheet_tag_filters_subscribers } from '@/lib/subscribe_sheet_tag_filters'
import { notify_theme_subscribers } from '@/lib/subscribe_theme'

/**
 * Notifies all UI preference stores and document-level subscribers.
 */
export function notify_all_ui_preference_subscribers(): void {
  accent_color_preference.notify()
  check_in_form_collapsed_preference.notify()
  clear_tag_filters_on_sheet_change_preference.notify()
  color_palette_preference.notify()
  confirm_before_checkout_preference.notify()
  confirm_destructive_actions_preference.notify()
  default_reporting_range_preference.notify()
  default_reporting_sort_preference.notify()
  duration_format_preference.notify()
  entry_list_sort_preference.notify()
  greedy_cloud_sync_preference.notify()
  tag_filter_mode_preference.notify()
  today_scope_preference.notify()
  theme_mode_preference.notify()
  time_format_preference.notify()
  timer_in_title_preference.notify()
  timer_show_seconds_preference.notify()
  week_starts_on_preference.notify()
  notify_compact_lists_subscribers()
  notify_theme_subscribers()
  notify_sheet_tag_filters_subscribers()
}

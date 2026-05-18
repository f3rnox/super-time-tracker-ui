'use client'

import { useSyncExternalStore } from 'react'

import { tag_filter_mode_preference } from '@/lib/preferences/tag_filter_mode_preference'
import { type TagFilterMode } from '@/lib/types/ui_preferences'

/**
 * Subscribes to the tag filter match mode preference.
 */
export function use_tag_filter_mode(): TagFilterMode {
  return useSyncExternalStore(
    tag_filter_mode_preference.subscribe,
    tag_filter_mode_preference.get_snapshot,
    tag_filter_mode_preference.get_server_snapshot,
  )
}

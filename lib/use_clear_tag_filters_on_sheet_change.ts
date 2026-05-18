'use client'

import { useSyncExternalStore } from 'react'

import { clear_tag_filters_on_sheet_change_preference } from '@/lib/preferences/clear_tag_filters_on_sheet_change_preference'

/**
 * Subscribes to the clear-tag-filters-on-sheet-change preference.
 */
export function use_clear_tag_filters_on_sheet_change(): boolean {
  const value = useSyncExternalStore(
    clear_tag_filters_on_sheet_change_preference.subscribe,
    clear_tag_filters_on_sheet_change_preference.get_snapshot,
    clear_tag_filters_on_sheet_change_preference.get_server_snapshot,
  )

  return value === 'true'
}

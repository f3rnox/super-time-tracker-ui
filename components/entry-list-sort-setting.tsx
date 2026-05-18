'use client'

import { useSyncExternalStore } from 'react'

import { SettingRadioGroup } from '@/components/setting-radio-group'
import { entry_list_sort_preference } from '@/lib/preferences/entry_list_sort_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'
import { type EntryListSort } from '@/lib/types/ui_preferences'

const options: { value: EntryListSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'duration', label: 'Longest duration' },
  { value: 'description', label: 'Description (A–Z)' },
]

const set_entry_list_sort = (value: EntryListSort): void => {
  persist_ui_preference(entry_list_sort_preference, value)
}

/**
 * Setting: default sort order for the entry list on the home view.
 */
export function EntryListSortSetting() {
  const value = useSyncExternalStore(
    entry_list_sort_preference.subscribe,
    entry_list_sort_preference.get_snapshot,
    entry_list_sort_preference.get_server_snapshot,
  )

  return (
    <SettingRadioGroup<EntryListSort>
      name="entry-list-sort"
      legend="Entry list sort"
      description="How entries are ordered on the active sheet."
      value={value}
      options={options}
      on_change={set_entry_list_sort}
    />
  )
}

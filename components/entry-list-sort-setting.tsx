'use client'

import { useSyncExternalStore } from 'react'

import { SettingRadioGroup } from '@/components/setting-radio-group'
import { entry_list_sort_preference } from '@/lib/preferences/entry_list_sort_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'
import { get_entry_list_sort_options } from '@/lib/get_entry_list_sort_options'
import { type EntryListSort } from '@/lib/types/ui_preferences'

const options = get_entry_list_sort_options().map((option) => ({
  value: option.value,
  label:
    option.value === 'newest'
      ? 'Newest first'
      : option.value === 'oldest'
        ? 'Oldest first'
        : option.value === 'duration'
          ? 'Longest duration'
          : 'Description (A–Z)',
}))

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

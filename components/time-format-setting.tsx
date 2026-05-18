'use client'

import { useSyncExternalStore } from 'react'

import { SettingRadioGroup } from '@/components/setting-radio-group'
import { time_format_preference } from '@/lib/preferences/time_format_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'
import { type TimeFormat } from '@/lib/types/ui_preferences'

const options: { value: TimeFormat; label: string; description: string }[] = [
  { value: '12h', label: '12-hour', description: 'e.g. 6:34 PM' },
  { value: '24h', label: '24-hour', description: 'e.g. 18:34' },
]

const set_time_format = (value: TimeFormat): void => {
  persist_ui_preference(time_format_preference, value)
}

/**
 * Setting: 12-hour vs 24-hour time display.
 */
export function TimeFormatSetting() {
  const value = useSyncExternalStore(
    time_format_preference.subscribe,
    time_format_preference.get_snapshot,
    time_format_preference.get_server_snapshot,
  )

  return (
    <SettingRadioGroup<TimeFormat>
      name="time-format"
      legend="Time format"
      description="Used for entry start/end times and notes timestamps."
      value={value}
      options={options}
      on_change={set_time_format}
    />
  )
}

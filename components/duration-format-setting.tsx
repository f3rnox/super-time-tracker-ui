'use client'

import { useSyncExternalStore } from 'react'

import { SettingRadioGroup } from '@/components/setting-radio-group'
import { duration_format_preference } from '@/lib/preferences/duration_format_preference'
import { type DurationFormat } from '@/lib/types/ui_preferences'

const options: { value: DurationFormat; label: string; description: string }[] = [
  { value: 'humanized', label: 'Humanized', description: 'e.g. 1 hour 25 minutes' },
  { value: 'clock', label: 'Clock', description: 'e.g. 01:25:00' },
  { value: 'decimal', label: 'Decimal hours', description: 'e.g. 1.42h' },
]

const set_duration_format = (value: DurationFormat): void => {
  duration_format_preference.write(value)
  duration_format_preference.notify()
}

/**
 * Setting: how to display durations across the app.
 */
export function DurationFormatSetting() {
  const value = useSyncExternalStore(
    duration_format_preference.subscribe,
    duration_format_preference.get_snapshot,
    duration_format_preference.get_server_snapshot,
  )

  return (
    <SettingRadioGroup<DurationFormat>
      name="duration-format"
      legend="Duration format"
      description="Applies to entry durations, reporting totals, and the active timer."
      value={value}
      options={options}
      on_change={set_duration_format}
    />
  )
}

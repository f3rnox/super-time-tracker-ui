'use client'

import { useSyncExternalStore } from 'react'

import { SettingRadioGroup } from '@/components/setting-radio-group'
import { week_starts_on_preference } from '@/lib/preferences/week_starts_on_preference'
import { type WeekStartsOn } from '@/lib/types/ui_preferences'

const options: { value: WeekStartsOn; label: string; description: string }[] = [
  { value: 'monday', label: 'Monday', description: 'ISO 8601 week (default).' },
  { value: 'sunday', label: 'Sunday', description: 'US-style week.' },
]

const set_week_starts_on = (value: WeekStartsOn): void => {
  week_starts_on_preference.write(value)
  week_starts_on_preference.notify()
}

/**
 * Setting: which day starts a week in reporting shortcuts.
 */
export function WeekStartsOnSetting() {
  const value = useSyncExternalStore(
    week_starts_on_preference.subscribe,
    week_starts_on_preference.get_snapshot,
    week_starts_on_preference.get_server_snapshot,
  )

  return (
    <SettingRadioGroup<WeekStartsOn>
      name="week-starts-on"
      legend="Week starts on"
      description={'Used for the "this week" reporting shortcuts and totals.'}
      value={value}
      options={options}
      on_change={set_week_starts_on}
    />
  )
}

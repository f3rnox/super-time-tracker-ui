'use client'

import { useEffect, useState } from 'react'

import { get_input_class_name } from '@/lib/get_input_class_name'
import { read_stored_default_sheet_fixed_name } from '@/lib/read_stored_default_sheet_fixed_name'
import { read_stored_default_sheet_session_mode } from '@/lib/read_stored_default_sheet_session_mode'
import { notify_settings_saved } from '@/lib/notify_settings_saved'
import { set_default_sheet_fixed_name } from '@/lib/set_default_sheet_fixed_name'
import { set_default_sheet_session_mode } from '@/lib/set_default_sheet_session_mode'
import { type DefaultSheetSessionMode } from '@/lib/types/ui_settings'

interface DefaultSheetSessionSettingProps {
  sheet_names: string[]
}

const mode_options: {
  value: DefaultSheetSessionMode
  label: string
  description: string
}[] = [
  {
    value: 'last_viewed',
    label: 'Last viewed',
    description: 'Open the sheet you were viewing when you last used the tracker.',
  },
  {
    value: 'active_timer',
    label: 'Sheet with active timer',
    description: 'Open the sheet that has a running timer, when one exists.',
  },
  {
    value: 'fixed',
    label: 'Specific sheet',
    description: 'Always open a chosen sheet when you start a new session.',
  },
]

/**
 * Configures which sheet loads on a new session.
 */
export function DefaultSheetSessionSetting({
  sheet_names,
}: DefaultSheetSessionSettingProps) {
  const [mode, set_mode] = useState<DefaultSheetSessionMode>('last_viewed')
  const [fixed_sheet_name, set_fixed_sheet_name] = useState('')

  useEffect(() => {
    set_mode(read_stored_default_sheet_session_mode())
    const stored_fixed_name = read_stored_default_sheet_fixed_name()
    const fallback_name = sheet_names[0] ?? ''

    set_fixed_sheet_name(stored_fixed_name ?? fallback_name)
  }, [sheet_names])

  const handle_mode_change = (next_mode: DefaultSheetSessionMode): void => {
    set_mode(next_mode)
    set_default_sheet_session_mode(next_mode)

    if (next_mode === 'fixed' && fixed_sheet_name.length > 0) {
      set_default_sheet_fixed_name(fixed_sheet_name)
    }

    notify_settings_saved()
  }

  const handle_fixed_sheet_change = (sheet_name: string): void => {
    set_fixed_sheet_name(sheet_name)
    set_default_sheet_fixed_name(sheet_name)
    notify_settings_saved()
  }

  return (
    <fieldset className="m-0 flex w-full flex-col gap-3 border-0 p-0">
      <legend className="mb-2 text-[0.95rem] font-semibold">
        Default sheet on new session
      </legend>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {mode_options.map((option) => (
          <li key={option.value}>
            <label className="flex w-full cursor-pointer items-start gap-2.5">
              <input
                type="radio"
                name="default-sheet-session-mode"
                className="mt-0.5 shrink-0"
                checked={mode === option.value}
                onChange={() => handle_mode_change(option.value)}
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-[0.9rem] font-semibold">{option.label}</span>
                <span className="text-[0.8rem] leading-snug text-muted">
                  {option.description}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {mode === 'fixed' ? (
        <label className="flex flex-col gap-1 text-[0.82rem] text-muted">
          Sheet
          <select
            className={get_input_class_name('compact')}
            value={fixed_sheet_name}
            disabled={sheet_names.length === 0}
            onChange={(event) => handle_fixed_sheet_change(event.target.value)}
          >
            {sheet_names.map((sheet_name) => (
              <option key={sheet_name} value={sheet_name}>
                {sheet_name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </fieldset>
  )
}

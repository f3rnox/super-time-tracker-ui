'use client'

import { useSyncExternalStore } from 'react'

import { accent_color_preference } from '@/lib/preferences/accent_color_preference'
import { notify_settings_saved } from '@/lib/notify_settings_saved'
import { set_accent_color } from '@/lib/set_accent_color'
import { type AccentColor } from '@/lib/types/ui_preferences'

interface AccentOption {
  value: AccentColor
  label: string
  swatch_dark: string
  swatch_light: string
}

const options: AccentOption[] = [
  { value: 'teal', label: 'Teal', swatch_dark: '#5eead4', swatch_light: '#0d9488' },
  { value: 'blue', label: 'Blue', swatch_dark: '#60a5fa', swatch_light: '#2563eb' },
  {
    value: 'violet',
    label: 'Violet',
    swatch_dark: '#c4b5fd',
    swatch_light: '#7c3aed',
  },
  { value: 'rose', label: 'Rose', swatch_dark: '#fb7185', swatch_light: '#e11d48' },
  {
    value: 'amber',
    label: 'Amber',
    swatch_dark: '#fbbf24',
    swatch_light: '#b45309',
  },
  {
    value: 'emerald',
    label: 'Emerald',
    swatch_dark: '#34d399',
    swatch_light: '#047857',
  },
]

/**
 * Setting: pick an accent color preset that recolors links, buttons, and highlights.
 */
export function AccentColorSetting() {
  const value = useSyncExternalStore(
    accent_color_preference.subscribe,
    accent_color_preference.get_snapshot,
    accent_color_preference.get_server_snapshot,
  )

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="m-0 mb-1 text-[0.95rem] font-semibold">
        Accent color
      </legend>
      <p className="m-0 mb-2 text-[0.8rem] leading-snug text-muted">
        Tints links, buttons, the active timer, and highlights.
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Accent color"
      >
        {options.map((option) => {
          const is_selected = option.value === value
          const gradient = `linear-gradient(135deg, ${option.swatch_light} 0%, ${option.swatch_light} 50%, ${option.swatch_dark} 50%, ${option.swatch_dark} 100%)`

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={is_selected}
              aria-label={option.label}
              title={option.label}
              onClick={() => {
                set_accent_color(option.value)
                notify_settings_saved()
              }}
              className={`relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                is_selected
                  ? 'border-foreground'
                  : 'border-panel-border hover:border-foreground'
              }`}
              style={{ background: gradient }}
            >
              {is_selected ? (
                <span
                  aria-hidden="true"
                  className="text-[0.95rem] font-bold leading-none text-white drop-shadow"
                >
                  ✓
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

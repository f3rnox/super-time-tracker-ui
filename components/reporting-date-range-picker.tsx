'use client'

import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { get_reporting_date_range_shortcut_inputs } from '@/lib/get_reporting_date_range_shortcut_inputs'
import { matches_reporting_date_range_shortcut } from '@/lib/matches_reporting_date_range_shortcut'
import { use_week_starts_on } from '@/lib/use_week_starts_on'
import { week_starts_on_to_index } from '@/lib/week_starts_on_to_index'
import {
  type ReportingDateRangeInputs,
  type ReportingDateRangeShortcut,
} from '@/lib/types/reporting'

export type { ReportingDateRangeInputs } from '@/lib/types/reporting'

const shortcut_options: {
  value: ReportingDateRangeShortcut
  label: string
}[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'year', label: 'This year' },
  { value: 'last_year', label: 'Last year' },
]

interface ReportingDateRangePickerProps {
  range: ReportingDateRangeInputs
  is_invalid: boolean
  on_range_change: (range: ReportingDateRangeInputs) => void
  on_clear: () => void
}

/**
 * Date range filter controls for the reporting view.
 */
export function ReportingDateRangePicker({
  range,
  is_invalid,
  on_range_change,
  on_clear,
}: ReportingDateRangePickerProps) {
  const week_starts_on = use_week_starts_on()
  const week_starts_on_index = week_starts_on_to_index(week_starts_on)
  const has_filter =
    range.from_date.length > 0 || range.to_date.length > 0

  return (
    <fieldset className="m-0 flex w-full max-w-2xl flex-col gap-2 rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
      <legend className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        Date range
      </legend>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Date range shortcuts">
        {shortcut_options.map((option) => {
          const is_active = matches_reporting_date_range_shortcut(
            range,
            option.value,
            new Date(),
            week_starts_on_index,
          )

          return (
            <button
              key={option.value}
              type="button"
              className={
                is_active
                  ? get_button_class_name('primary', 'small')
                  : get_button_class_name('ghost', 'small')
              }
              aria-pressed={is_active}
              onClick={() =>
                on_range_change(
                  get_reporting_date_range_shortcut_inputs(
                    option.value,
                    new Date(),
                    week_starts_on_index,
                  ),
                )
              }
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-[0.82rem] text-muted">
          From
          <input
            type="date"
            className={get_input_class_name('compact')}
            value={range.from_date}
            onChange={(event) =>
              on_range_change({
                ...range,
                from_date: event.target.value,
              })
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-[0.82rem] text-muted">
          To
          <input
            type="date"
            className={get_input_class_name('compact')}
            value={range.to_date}
            onChange={(event) =>
              on_range_change({
                ...range,
                to_date: event.target.value,
              })
            }
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={get_button_class_name('ghost', 'small')}
          disabled={!has_filter}
          onClick={on_clear}
        >
          Clear
        </button>
        {is_invalid ? (
          <span className="text-[0.82rem] text-danger">
            Enter a valid from and to date.
          </span>
        ) : null}
      </div>
    </fieldset>
  )
}

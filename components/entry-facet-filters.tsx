'use client'

import { ReportingDateRangePicker } from '@/components/reporting-date-range-picker'
import { format_display_tag } from '@/lib/format_display_tag'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_input_class_name } from '@/lib/get_input_class_name'
import { get_date_range_ms_from_inputs } from '@/lib/get_date_range_ms_from_inputs'
import { get_empty_entry_export_filters } from '@/lib/get_empty_entry_export_filters'
import { type EntryFacetFilters } from '@/lib/types/entry_facet_filters'
import { type ReportingDateRangeInputs } from '@/lib/types/reporting'

interface EntryFacetFiltersPanelProps {
  filters: EntryFacetFilters
  sheet_names: string[]
  tag_names: string[]
  is_pending?: boolean
  clear_label?: string
  on_change: (filters: EntryFacetFilters) => void
  on_clear?: () => void
}

/**
 * Sheet, tag, and date range filters shared by search and export.
 */
export function EntryFacetFiltersPanel({
  filters,
  sheet_names,
  tag_names,
  is_pending = false,
  clear_label = 'Clear filters',
  on_change,
  on_clear,
}: EntryFacetFiltersPanelProps) {
  const date_range: ReportingDateRangeInputs = {
    from_date: filters.fromDate,
    to_date: filters.toDate,
  }
  const range_is_partial =
    (filters.fromDate.length > 0) !== (filters.toDate.length > 0)
  const range_is_invalid =
    range_is_partial ||
    (filters.fromDate.length > 0 &&
      filters.toDate.length > 0 &&
      get_date_range_ms_from_inputs(filters.fromDate, filters.toDate) === null)

  const has_filters =
    filters.sheetName.length > 0 ||
    filters.tag.length > 0 ||
    filters.fromDate.length > 0 ||
    filters.toDate.length > 0

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Sheet
          </span>
          <select
            className={get_input_class_name('compact')}
            value={filters.sheetName}
            disabled={is_pending}
            onChange={(event) =>
              on_change({ ...filters, sheetName: event.target.value })
            }
          >
            <option value="">All sheets</option>
            {sheet_names.map((sheet_name) => (
              <option key={sheet_name} value={sheet_name}>
                {sheet_name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Tag
          </span>
          <select
            className={get_input_class_name('compact')}
            value={filters.tag}
            disabled={is_pending}
            onChange={(event) => on_change({ ...filters, tag: event.target.value })}
          >
            <option value="">Any tag</option>
            {tag_names.map((tag_name) => (
              <option key={tag_name} value={tag_name}>
                {format_display_tag(tag_name)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ReportingDateRangePicker
        range={date_range}
        is_invalid={range_is_invalid}
        on_range_change={(range) =>
          on_change({
            ...filters,
            fromDate: range.from_date,
            toDate: range.to_date,
          })
        }
        on_clear={() =>
          on_change({
            ...filters,
            fromDate: '',
            toDate: '',
          })
        }
      />

      {has_filters ? (
        <div>
          <button
            type="button"
            className={get_button_class_name('ghost', 'small')}
            disabled={is_pending}
            onClick={() => {
              if (on_clear !== undefined) {
                on_clear()
                return
              }

              on_change(get_empty_entry_export_filters())
            }}
          >
            {clear_label}
          </button>
        </div>
      ) : null}
    </div>
  )
}

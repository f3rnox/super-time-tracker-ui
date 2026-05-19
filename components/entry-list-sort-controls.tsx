'use client'

import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_entry_list_sort_options } from '@/lib/get_entry_list_sort_options'
import { entry_list_sort_preference } from '@/lib/preferences/entry_list_sort_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'
import { use_entry_list_sort } from '@/lib/use_entry_list_sort'

interface EntryListSortControlsProps {
  is_pending?: boolean
}

const sort_options = get_entry_list_sort_options()

/**
 * Sort order toggles for the active sheet entry list.
 */
export function EntryListSortControls({
  is_pending = false,
}: EntryListSortControlsProps) {
  const sort = use_entry_list_sort()

  return (
    <fieldset className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-0 p-0">
      <legend className="sr-only">Order entries by</legend>
      <span className="shrink-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
        Order by
      </span>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Order entries by">
        {sort_options.map((option) => {
          const is_selected = sort === option.value

          return (
            <button
              key={option.value}
              type="button"
              className={
                is_selected
                  ? get_button_class_name('primary', 'small')
                  : get_button_class_name('ghost', 'small')
              }
              disabled={is_pending}
              aria-pressed={is_selected}
              onClick={() =>
                persist_ui_preference(entry_list_sort_preference, option.value)
              }
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

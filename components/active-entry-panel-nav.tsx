'use client'

import { ChevronIcon } from '@/components/chevron-icon'

interface ActiveEntryNavButtonsProps {
  is_pending: boolean
  on_previous: () => void
  on_next: () => void
}

const nav_button_class =
  'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-panel-border bg-panel text-muted hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-55'

/**
 * Previous / next controls for cycling multiple running entries.
 */
export function ActiveEntryNavButtons({
  is_pending,
  on_previous,
  on_next,
}: ActiveEntryNavButtonsProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5" role="group" aria-label="Active timers">
      <button
        type="button"
        className={nav_button_class}
        aria-label="Previous active timer"
        title="Previous active timer"
        disabled={is_pending}
        onClick={on_previous}
      >
        <ChevronIcon className="rotate-180" />
      </button>
      <button
        type="button"
        className={nav_button_class}
        aria-label="Next active timer"
        title="Next active timer"
        disabled={is_pending}
        onClick={on_next}
      >
        <ChevronIcon />
      </button>
    </div>
  )
}

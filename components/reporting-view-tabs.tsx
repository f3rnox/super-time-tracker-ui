'use client'

import { get_button_class_name } from '@/lib/get_button_class_name'

export type ReportingViewTab = 'dashboard' | 'sheets'

interface ReportingViewTabsProps {
  active_tab: ReportingViewTab
  on_change: (tab: ReportingViewTab) => void
}

const TAB_OPTIONS: { value: ReportingViewTab; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'sheets', label: 'Sheets' },
]

/**
 * Top-level tab switcher between the reporting dashboard and the sheet breakdown.
 */
export function ReportingViewTabs({
  active_tab,
  on_change,
}: ReportingViewTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Reporting view"
      className="inline-flex w-full max-w-2xl items-center gap-1 self-center rounded-full border border-panel-border bg-surface-raised/50 p-1"
    >
      {TAB_OPTIONS.map((tab) => {
        const is_active = tab.value === active_tab
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={is_active}
            className={`${get_button_class_name('ghost', 'small')} flex-1 rounded-full border-transparent ${
              is_active
                ? 'bg-accent text-accent-text-on'
                : 'bg-transparent text-muted'
            }`}
            onClick={() => on_change(tab.value)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

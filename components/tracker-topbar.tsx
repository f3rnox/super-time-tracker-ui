'use client'

import { TrackerNavLinks } from '@/components/tracker-nav-links'
import { TopbarCloudStatus } from '@/components/topbar-cloud-status'
import { TopbarOverflowMenu } from '@/components/topbar-overflow-menu'
import { TopbarSettingsLink } from '@/components/topbar-settings-link'
import {
  TrackerBreadcrumb,
  type TrackerBreadcrumbSegment,
} from '@/components/tracker-breadcrumb'

export interface TrackerTopbarBreadcrumb {
  current: string
  parent?: TrackerBreadcrumbSegment
}

interface TrackerTopbarProps {
  breadcrumb?: TrackerTopbarBreadcrumb
}

/**
 * Sticky app navbar with branding, breadcrumbs, and theme switcher.
 */
export function TrackerTopbar({ breadcrumb }: TrackerTopbarProps = {}) {
  return (
    <header className="relative z-1 border-b border-panel-border bg-[color-mix(in_srgb,var(--panel)_92%,var(--background))] shadow-sm backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1120px] min-h-13 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-5">
        <span className="inline-flex min-w-0 shrink items-center font-mono text-[0.72rem] font-semibold uppercase leading-tight tracking-[0.08em] text-accent whitespace-nowrap">
          super-time-tracker
        </span>
        {breadcrumb !== undefined ? (
          <div className="min-w-0 flex-1">
            <TrackerBreadcrumb current={breadcrumb.current} parent={breadcrumb.parent} />
          </div>
        ) : null}
        <div className="flex w-full items-center justify-between gap-2 min-[980px]:ml-auto min-[980px]:w-auto min-[980px]:justify-end">
          <TrackerNavLinks />
          <div className="flex shrink-0 items-center justify-end gap-2">
            <TopbarCloudStatus />
            <TopbarSettingsLink />
            <TopbarOverflowMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

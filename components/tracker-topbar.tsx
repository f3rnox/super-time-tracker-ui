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
      <div className="mx-auto flex max-w-[1120px] min-h-13 flex-wrap items-center gap-x-4 gap-y-2 px-5">
        <span className="inline-flex shrink-0 items-center font-mono text-[0.72rem] font-semibold uppercase leading-tight tracking-[0.08em] text-accent whitespace-nowrap">
          super-time-tracker
        </span>
        {breadcrumb !== undefined ? (
          <TrackerBreadcrumb current={breadcrumb.current} parent={breadcrumb.parent} />
        ) : null}
        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          <TrackerNavLinks />
          <TopbarCloudStatus />
          <TopbarSettingsLink />
          <TopbarOverflowMenu />
        </div>
      </div>
    </header>
  )
}

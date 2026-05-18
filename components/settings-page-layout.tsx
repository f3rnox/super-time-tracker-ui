import { type ReactNode } from 'react'

import { SettingsNav } from '@/components/settings-nav'
import { SettingsSavedToast } from '@/components/settings-saved-toast'
import {
  TrackerTopbar,
  type TrackerTopbarBreadcrumb,
} from '@/components/tracker-topbar'

interface SettingsPageLayoutProps {
  breadcrumb: TrackerTopbarBreadcrumb
  title: string
  description?: string
  children: ReactNode
}

/**
 * Shared chrome for settings sub-pages: topbar, sidebar nav, and main content.
 */
export function SettingsPageLayout({
  breadcrumb,
  title,
  description,
  children,
}: SettingsPageLayoutProps) {
  return (
    <>
      <SettingsSavedToast />
      <TrackerTopbar breadcrumb={breadcrumb} />
      <main className="mx-auto grid w-full max-w-[1120px] grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] gap-6 px-5 pb-10 pt-6 max-[860px]:grid-cols-1">
        <aside className="flex flex-col gap-2">
          <h2 className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted">
            Settings
          </h2>
          <SettingsNav />
        </aside>
        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h1 className="m-0 text-[1.35rem] font-[650] tracking-tight">
              {title}
            </h1>
            {description !== undefined ? (
              <p className="m-0 text-[0.9rem] leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
          </header>
          {children}
        </section>
      </main>
    </>
  )
}

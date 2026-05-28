import Link from 'next/link'

import { BackupRestoreSetting } from '@/components/backup-restore-setting'
import { DbExportSetting } from '@/components/db-export-setting'
import { SettingsPageLayout } from '@/components/settings-page-layout'
import { type JSONTimeTrackerDB } from '@/lib/types'

interface DataSettingsViewProps {
  db_path: string
  db: JSONTimeTrackerDB
  sheet_names: string[]
  tag_names: string[]
}

/**
 * Settings page: backup, restore, and tag management entry point.
 */
export function DataSettingsView({
  db_path,
  db,
  sheet_names,
  tag_names,
}: DataSettingsViewProps) {
  return (
    <SettingsPageLayout
      breadcrumb={{
        current: 'Data & backup',
        parent: { label: 'Settings', href: '/settings' },
      }}
      title="Data & backup"
      description="Database backups and bulk operations on stored entries."
    >
      <ul
        className="m-0 flex w-full list-none flex-col gap-2 p-0"
        aria-label="Data settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <BackupRestoreSetting db_path={db_path} />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <DbExportSetting
            db={db}
            sheet_names={sheet_names}
            tag_names={tag_names}
          />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.95rem] font-semibold">Tag management</span>
            <span className="text-[0.8rem] leading-snug text-muted">
              Rename or merge @tags used across all entries.
            </span>
            <Link
              className="mt-2 self-start text-[0.85rem] font-semibold text-accent no-underline hover:underline"
              href="/settings/tags"
            >
              Manage tags
            </Link>
          </div>
        </li>
      </ul>
    </SettingsPageLayout>
  )
}

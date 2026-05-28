import { FocusGoalsNudgesSetting } from '@/components/focus-goals-nudges-setting'
import { SettingsPageLayout } from '@/components/settings-page-layout'

interface GoalSettingsViewProps {
  sheet_names: string[]
  tag_names: string[]
}

/**
 * Settings page: goal scopes, targets, and reminder nudges.
 */
export function GoalSettingsView({
  sheet_names,
  tag_names,
}: GoalSettingsViewProps) {
  return (
    <SettingsPageLayout
      breadcrumb={{
        current: 'Goals',
        parent: { label: 'Settings', href: '/settings' },
      }}
      title="Goals"
      description="Configure focus targets globally, per-sheet, or per-tag."
    >
      <ul className="m-0 flex w-full list-none flex-col gap-2 p-0" aria-label="Goal settings">
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <FocusGoalsNudgesSetting sheet_names={sheet_names} tag_names={tag_names} />
        </li>
      </ul>
    </SettingsPageLayout>
  )
}

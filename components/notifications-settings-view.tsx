import { DesktopNotificationsSetting } from '@/components/desktop-notifications-setting'
import { SettingsPageLayout } from '@/components/settings-page-layout'

/**
 * Settings page for desktop and in-app notification behavior.
 */
export function NotificationsSettingsView() {
  return (
    <SettingsPageLayout
      breadcrumb={{
        current: 'Notifications',
        parent: { label: 'Settings', href: '/settings' },
      }}
      title="Notifications"
      description="Control desktop and in-app notification delivery."
    >
      <ul
        className="m-0 flex w-full list-none flex-col gap-2 p-0"
        aria-label="Notification settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <DesktopNotificationsSetting />
        </li>
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.95rem] font-semibold">Delivery behavior</span>
            <span className="text-[0.8rem] leading-snug text-muted">
              When the app tab is focused, notifications are shown in-app only.
              Desktop notifications are used when the app is in the background.
            </span>
          </div>
        </li>
      </ul>
    </SettingsPageLayout>
  )
}

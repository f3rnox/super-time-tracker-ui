'use client'

import { useState, useSyncExternalStore } from 'react'

import { desktop_notifications_preference } from '@/lib/preferences/desktop_notifications_preference'
import { persist_ui_preference } from '@/lib/persist_ui_preference'
import { supports_desktop_notifications } from '@/lib/notify_desktop'

const set_desktop_notifications = (enabled: boolean): void => {
  persist_ui_preference(
    desktop_notifications_preference,
    enabled ? 'true' : 'false',
  )
}

/**
 * Setting: enable browser desktop notifications for tracker start/stop events.
 */
export function DesktopNotificationsSetting() {
  const value = useSyncExternalStore(
    desktop_notifications_preference.subscribe,
    desktop_notifications_preference.get_snapshot,
    desktop_notifications_preference.get_server_snapshot,
  )
  const supported = supports_desktop_notifications()
  const [permission, set_permission] = useState<NotificationPermission | null>(() =>
    supported ? Notification.permission : null,
  )

  return (
    <div className="flex w-full flex-col gap-2.5">
      <label className="flex w-full cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          className="shrink-0"
          checked={value === 'true'}
          disabled={!supported}
          onChange={(event) => set_desktop_notifications(event.target.checked)}
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.95rem] font-semibold">Desktop notifications</span>
          <span className="text-[0.8rem] leading-snug text-muted">
            Show browser notifications when tracking starts or stops.
          </span>
        </span>
      </label>
      {supported ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 text-[0.78rem] text-muted">
            Permission: {permission ?? 'default'}
          </p>
          {permission !== 'granted' ? (
            <button
              type="button"
              className="rounded-md border border-panel-border bg-surface-raised px-2 py-1 text-[0.78rem] font-semibold hover:bg-surface-hover"
              onClick={async () => {
                const next_permission = await Notification.requestPermission()
                set_permission(next_permission)
              }}
            >
              Allow notifications
            </button>
          ) : null}
        </div>
      ) : (
        <p className="m-0 text-[0.78rem] text-muted">
          Your browser does not support desktop notifications.
        </p>
      )}
    </div>
  )
}

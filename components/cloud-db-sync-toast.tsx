'use client'

import { useEffect, useState } from 'react'

import {
  type CloudDbSyncNotification,
  subscribe_cloud_db_sync,
} from '@/lib/notify_cloud_db_sync'

const toast_visible_ms = 2800

/**
 * Toast with a progress bar for background cloud database sync.
 */
export function CloudDbSyncToast() {
  const [notification, set_notification] = useState<CloudDbSyncNotification | null>(
    null,
  )

  useEffect(() => {
    let hide_timer: ReturnType<typeof setTimeout> | null = null

    const unsubscribe = subscribe_cloud_db_sync((next_notification) => {
      set_notification(next_notification)

      if (hide_timer !== null) {
        clearTimeout(hide_timer)
        hide_timer = null
      }

      if (
        next_notification?.phase === 'success' ||
        next_notification?.phase === 'error'
      ) {
        hide_timer = setTimeout(() => {
          set_notification(null)
          hide_timer = null
        }, toast_visible_ms)
      }
    })

    return () => {
      unsubscribe()

      if (hide_timer !== null) {
        clearTimeout(hide_timer)
      }
    }
  }, [])

  if (notification === null) {
    return null
  }

  const is_syncing = notification.phase === 'syncing'
  const is_error = notification.phase === 'error'
  const progress_percent =
    notification.phase === 'success'
      ? 100
      : notification.phase === 'error'
        ? 0
        : null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="w-full rounded-md border border-accent-border bg-panel px-4 py-3 text-[0.88rem] font-medium text-foreground shadow-md"
    >
      <p className="m-0 mb-2.5 leading-snug">{notification.message}</p>
      <div
        className="h-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--accent)_22%,var(--panel-border))]"
        aria-hidden="true"
      >
        {is_syncing ? (
          <div className="cloud-db-sync-progress-indeterminate h-full w-1/3 rounded-full bg-accent" />
        ) : (
          <div
            className={`h-full rounded-full transition-[width] duration-300 ease-out ${is_error ? 'bg-danger' : 'bg-accent'}`}
            style={{ width: `${progress_percent ?? 0}%` }}
          />
        )}
      </div>
    </div>
  )
}

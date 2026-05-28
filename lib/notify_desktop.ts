'use client'

import { notify_in_app } from '@/lib/notify_in_app'

interface NotifyDesktopArgs {
  title: string
  body: string
  tag?: string
}

/**
 * Sends a browser desktop notification when permission is granted.
 */
export function notify_desktop(args: NotifyDesktopArgs): void {
  notify_in_app({
    title: args.title,
    body: args.body,
  })

  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return
  }

  const app_is_focused =
    typeof document !== 'undefined' &&
    document.visibilityState === 'visible' &&
    document.hasFocus()

  if (app_is_focused) {
    return
  }

  if (Notification.permission !== 'granted') {
    return
  }

  const { body, tag, title } = args
  const options: NotificationOptions = {
    body,
    ...(tag !== undefined ? { tag } : {}),
  }

  try {
    new Notification(title, options)
  } catch {
    // Ignore notification failures.
  }
}

/**
 * Returns whether this browser can show desktop notifications.
 */
export function supports_desktop_notifications(): boolean {
  return typeof window !== 'undefined' && typeof Notification !== 'undefined'
}

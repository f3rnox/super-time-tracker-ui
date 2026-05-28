export interface InAppNotification {
  title: string
  body: string
}

type InAppNotificationListener = (notification: InAppNotification) => void

const listeners = new Set<InAppNotificationListener>()

/**
 * Subscribes to lightweight in-app notification events.
 */
export function subscribe_in_app_notifications(
  listener: InAppNotificationListener,
): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/**
 * Broadcasts an in-app notification to toast listeners.
 */
export function notify_in_app(notification: InAppNotification): void {
  if (typeof window === 'undefined') {
    return
  }

  listeners.forEach((listener) => {
    listener(notification)
  })
}

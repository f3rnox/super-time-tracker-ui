"use client";

import { useEffect, useState } from "react";

import {
  type InAppNotification,
  subscribe_in_app_notifications,
} from "@/lib/notify_in_app";

const toast_visible_ms = 3200;

/**
 * Bottom-right toast for app-triggered notification events.
 */
export function InAppNotificationsToast() {
  const [notification, setNotification] = useState<InAppNotification | null>(
    null,
  );

  useEffect(() => {
    let hide_timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = subscribe_in_app_notifications((next_notification) => {
      setNotification(next_notification);

      if (hide_timer !== null) {
        clearTimeout(hide_timer);
      }

      hide_timer = setTimeout(() => {
        setNotification(null);
        hide_timer = null;
      }, toast_visible_ms);
    });

    return () => {
      unsubscribe();

      if (hide_timer !== null) {
        clearTimeout(hide_timer);
      }
    };
  }, []);

  if (notification === null) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="w-full rounded-md border border-accent-border bg-panel px-4 py-2.5 text-foreground shadow-md"
    >
      <p className="m-0 text-[0.84rem] font-semibold">{notification.title}</p>
      <p className="m-0 mt-0.5 text-[0.8rem] leading-snug text-muted">
        {notification.body}
      </p>
    </div>
  );
}

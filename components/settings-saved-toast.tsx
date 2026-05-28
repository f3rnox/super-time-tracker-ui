"use client";

import { useEffect, useState } from "react";

import {
  SETTINGS_SAVED_DEFAULT_MESSAGE,
  subscribe_settings_saved,
} from "@/lib/notify_settings_saved";

const toast_visible_ms = 2800;

/**
 * Fixed toast shown when a settings preference is persisted.
 */
export function SettingsSavedToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let hide_timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = subscribe_settings_saved((next_message) => {
      setMessage(next_message);

      if (hide_timer !== null) {
        clearTimeout(hide_timer);
      }

      hide_timer = setTimeout(() => {
        setMessage(null);
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

  if (message === null) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="w-full rounded-md border border-accent-border bg-panel px-4 py-2.5 text-[0.88rem] font-medium text-foreground shadow-md transition-[opacity,transform] duration-200"
    >
      {message || SETTINGS_SAVED_DEFAULT_MESSAGE}
    </div>
  );
}

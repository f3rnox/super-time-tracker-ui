"use client";

import { CloudDbSyncToast } from "@/components/cloud-db-sync-toast";
import { InAppNotificationsToast } from "@/components/in-app-notifications-toast";
import { SettingsSavedToast } from "@/components/settings-saved-toast";

const toast_stack_class =
  "pointer-events-none fixed z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col items-end gap-2 right-[max(1rem,env(safe-area-inset-right,0px))] bottom-[max(1rem,env(safe-area-inset-bottom,0px))]";

/**
 * Bottom-right stack for settings and cloud sync toasts.
 */
export function ToastNotifications() {
  return (
    <div className={toast_stack_class}>
      <InAppNotificationsToast />
      <CloudDbSyncToast />
      <SettingsSavedToast />
    </div>
  );
}

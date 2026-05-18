import { notify_settings_saved } from '@/lib/notify_settings_saved'
import { type UiPreferenceStore } from '@/lib/ui_preference_store'

/**
 * Writes a UI preference, notifies subscribers, and shows the saved toast.
 */
export function persist_ui_preference<T extends string>(
  store: UiPreferenceStore<T>,
  value: T,
): void {
  if (store.read() === value) {
    return
  }

  store.write(value)
  store.notify()
  notify_settings_saved()
}

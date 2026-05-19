import { apply_ui_preferences_from_record } from '@/lib/apply_ui_preferences_from_record'
import { collect_ui_preferences_from_window } from '@/lib/collect_ui_preferences_from_window'

/**
 * POSTs local UI preferences for merge-on-load and applies the merged record.
 */
export async function merge_ui_preferences_from_cloud_on_load(): Promise<void> {
  const local_preferences = collect_ui_preferences_from_window()

  const response = await fetch('/api/ui-preferences/merge-on-load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences: local_preferences }),
  })

  if (!response.ok) {
    const body = (await response.json()) as { error?: string }
    throw new Error(body.error ?? 'UI preferences merge on load failed')
  }

  const payload = (await response.json()) as {
    preferences?: Record<string, string>
  }

  apply_ui_preferences_from_record(payload.preferences ?? {})
}

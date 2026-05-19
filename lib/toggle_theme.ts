import { apply_theme } from '@/lib/apply_theme'
import { notify_settings_saved } from '@/lib/notify_settings_saved'
import { theme_mode_preference } from '@/lib/preferences/theme_mode_preference'
import { read_document_theme } from '@/lib/read_document_theme'
import { notify_theme_subscribers } from '@/lib/subscribe_theme'
import { type Theme } from '@/lib/types/theme'
import { write_stored_theme } from '@/lib/write_stored_theme'

/**
 * Toggles the applied theme and sets the corresponding theme mode preference.
 */
export function toggle_theme(): void {
  const current_theme = read_document_theme()
  const next_theme: Theme = current_theme === 'dark' ? 'light' : 'dark'

  apply_theme(next_theme)
  write_stored_theme(next_theme)
  theme_mode_preference.write(next_theme)
  theme_mode_preference.notify()
  notify_theme_subscribers()
  notify_settings_saved()
}

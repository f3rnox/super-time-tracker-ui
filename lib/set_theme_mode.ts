import { apply_theme } from '@/lib/apply_theme'
import { notify_theme_subscribers } from '@/lib/subscribe_theme'
import { resolve_theme_mode_to_theme } from '@/lib/resolve_theme_mode_to_theme'
import { theme_mode_preference } from '@/lib/preferences/theme_mode_preference'
import { write_stored_theme } from '@/lib/write_stored_theme'
import { type ThemeMode } from '@/lib/types/ui_preferences'

/**
 * Persists the theme mode, applies the resolved theme, and notifies subscribers.
 */
export function set_theme_mode(mode: ThemeMode): void {
  theme_mode_preference.write(mode)
  theme_mode_preference.notify()

  const resolved = resolve_theme_mode_to_theme(mode)
  apply_theme(resolved)
  write_stored_theme(resolved)
  notify_theme_subscribers()
}

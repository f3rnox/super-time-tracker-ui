import { create_ui_preference_store } from '@/lib/ui_preference_store'
import {
  THEME_MODE_DEFAULT,
  THEME_MODE_STORAGE_KEY,
  type ThemeMode,
} from '@/lib/types/ui_preferences'

const is_theme_mode = (value: string): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

/**
 * Theme preference store: light, dark, or follow system.
 */
export const theme_mode_preference = create_ui_preference_store<ThemeMode>({
  storage_key: THEME_MODE_STORAGE_KEY,
  default_value: THEME_MODE_DEFAULT,
  is_valid: is_theme_mode,
})

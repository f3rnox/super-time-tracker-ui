import { COMPACT_LISTS_STORAGE_KEY } from '@/lib/types/ui_settings'
import {
  ACCENT_COLOR_STORAGE_KEY,
  COLOR_PALETTE_DEFAULT,
  COLOR_PALETTE_STORAGE_KEY,
  COLOR_PALETTE_VALUES,
} from '@/lib/types/ui_preferences'

const accent_to_palette_migration: Record<string, string> = {
  teal: 'default',
  blue: 'ocean',
  violet: 'midnight',
  rose: 'warm',
  amber: 'warm',
  emerald: 'forest',
}

/**
 * Inline script that applies UI settings before first paint.
 */
export const ui_settings_init_script = `(function(){try{var k=${JSON.stringify(
  COMPACT_LISTS_STORAGE_KEY,
)};var s=localStorage.getItem(k);var c=s==='true';document.documentElement.setAttribute('data-compact-lists',c?'true':'false');var pk=${JSON.stringify(
  COLOR_PALETTE_STORAGE_KEY,
)};var pv=localStorage.getItem(pk);var palettes=${JSON.stringify(
  COLOR_PALETTE_VALUES,
)};var migrate=${JSON.stringify(accent_to_palette_migration)};var ak=${JSON.stringify(
  ACCENT_COLOR_STORAGE_KEY,
)};var p=palettes.indexOf(pv)>=0?pv:(migrate[localStorage.getItem(ak)]||${JSON.stringify(
  COLOR_PALETTE_DEFAULT,
)});document.documentElement.setAttribute('data-palette',p);if(palettes.indexOf(pv)<0){localStorage.setItem(pk,p)}}catch(e){document.documentElement.setAttribute('data-compact-lists','false');document.documentElement.setAttribute('data-palette',${JSON.stringify(
  COLOR_PALETTE_DEFAULT,
)})}})();`

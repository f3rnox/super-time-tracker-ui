import { COMPACT_LISTS_STORAGE_KEY } from "@/lib/types/ui_settings";
import {
  ACCENT_COLOR_DEFAULT,
  ACCENT_COLOR_STORAGE_KEY,
  ACCENT_COLOR_VALUES,
} from "@/lib/types/ui_preferences";

/**
 * Inline script that applies UI settings (compact lists, accent color) before first paint.
 */
export const ui_settings_init_script = `(function(){try{var k=${JSON.stringify(
  COMPACT_LISTS_STORAGE_KEY,
)};var s=localStorage.getItem(k);var c=s==='true';document.documentElement.setAttribute('data-compact-lists',c?'true':'false');var ak=${JSON.stringify(
  ACCENT_COLOR_STORAGE_KEY,
)};var av=localStorage.getItem(ak);var allowed=${JSON.stringify(
  ACCENT_COLOR_VALUES,
)};var a=allowed.indexOf(av)>=0?av:${JSON.stringify(
  ACCENT_COLOR_DEFAULT,
)};document.documentElement.setAttribute('data-accent',a)}catch(e){document.documentElement.setAttribute('data-compact-lists','false');document.documentElement.setAttribute('data-accent',${JSON.stringify(
  ACCENT_COLOR_DEFAULT,
)})}})();`;

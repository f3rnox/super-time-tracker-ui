import { COMPACT_LISTS_STORAGE_KEY } from "@/lib/types/ui_settings";

/**
 * Inline script that applies compact-list UI settings before first paint.
 */
export const ui_settings_init_script = `(function(){try{var k=${JSON.stringify(COMPACT_LISTS_STORAGE_KEY)};var s=localStorage.getItem(k);var c=s==='true';document.documentElement.setAttribute('data-compact-lists',c?'true':'false')}catch(e){document.documentElement.setAttribute('data-compact-lists','false')}})();`;

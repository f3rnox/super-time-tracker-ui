import { THEME_STORAGE_KEY } from "@/lib/types/theme";
import { THEME_MODE_STORAGE_KEY } from "@/lib/types/ui_preferences";

/**
 * Inline script that sets the theme before first paint to avoid flashing.
 */
export const theme_init_script = `(function(){try{var mk=${JSON.stringify(
  THEME_MODE_STORAGE_KEY,
)};var tk=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var m=localStorage.getItem(mk);if(m!=='light'&&m!=='dark'&&m!=='system'){var legacy=localStorage.getItem(tk);m=legacy==='light'||legacy==='dark'?legacy:'system';localStorage.setItem(mk,m)}var resolve=function(mode){if(mode==='light'||mode==='dark')return mode;return window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'};var t=resolve(m);document.documentElement.setAttribute('data-theme',t);localStorage.setItem(tk,t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

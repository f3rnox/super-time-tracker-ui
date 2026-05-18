import { THEME_STORAGE_KEY } from "@/lib/types/theme";

/**
 * Inline script that sets the theme before first paint to avoid flashing.
 */
export const theme_init_script = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t);if(s!=='light'&&s!=='dark'){localStorage.setItem(k,t)}}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

import { type Theme } from "@/lib/types/theme";

/**
 * Applies the theme to the document root element.
 */
export function apply_theme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

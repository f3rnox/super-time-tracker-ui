import { type AccentColor } from "@/lib/types/ui_preferences";

/**
 * Sets the active accent color on the document element.
 */
export function apply_accent_color(value: AccentColor): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-accent", value);
}

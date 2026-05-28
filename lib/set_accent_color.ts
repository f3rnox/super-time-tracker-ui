import { accent_color_preference } from "@/lib/preferences/accent_color_preference";
import { apply_accent_color } from "@/lib/apply_accent_color";
import { type AccentColor } from "@/lib/types/ui_preferences";

/**
 * Persists the accent color preference, applies it, and notifies subscribers.
 */
export function set_accent_color(value: AccentColor): void {
  accent_color_preference.write(value);
  apply_accent_color(value);
  accent_color_preference.notify();
}

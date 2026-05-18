import { apply_theme } from "@/lib/apply_theme";
import { notify_theme_subscribers } from "@/lib/subscribe_theme";
import { read_document_theme } from "@/lib/read_document_theme";
import { type Theme } from "@/lib/types/theme";
import { write_stored_theme } from "@/lib/write_stored_theme";

/**
 * Toggles the document theme and notifies subscribers.
 */
export function toggle_theme(): void {
  const current_theme = read_document_theme();
  const next_theme: Theme = current_theme === "dark" ? "light" : "dark";

  apply_theme(next_theme);
  write_stored_theme(next_theme);
  notify_theme_subscribers();
}

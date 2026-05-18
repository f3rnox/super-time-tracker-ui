import { apply_compact_lists } from "@/lib/apply_compact_lists";
import { notify_compact_lists_subscribers } from "@/lib/subscribe_compact_lists";
import { write_stored_compact_lists } from "@/lib/write_stored_compact_lists";

/**
 * Updates the compact lists UI setting in the DOM and localStorage.
 */
export function set_compact_lists(enabled: boolean): void {
  apply_compact_lists(enabled);
  write_stored_compact_lists(enabled);
  notify_compact_lists_subscribers();
}

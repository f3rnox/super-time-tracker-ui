import { type CheckOutOptions } from "@/lib/types/check_out_options";
import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

/**
 * Builds confirm dialog options for checking out of an active timer.
 */
export function get_check_out_confirm_dialog(
  options?: CheckOutOptions,
): ConfirmDialogOptions {
  const trimmed_at = options?.at?.trim() ?? "";
  const trimmed_note = options?.note?.trim() ?? "";
  const has_at = trimmed_at.length > 0;
  const has_note = trimmed_note.length > 0;

  let message = "Stop the active timer and save this entry?";

  if (has_at && has_note) {
    message = `Stop the timer at "${trimmed_at}" and save a checkout note?`;
  } else if (has_at) {
    message = `Stop the timer and check out at "${trimmed_at}"?`;
  } else if (has_note) {
    message = "Stop the timer and save this entry with your checkout note?";
  }

  return {
    title: "Check out?",
    message,
    confirmLabel: "Check out",
    variant: "danger",
  };
}

import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

/**
 * Skips confirmation when destructive-action prompts are disabled.
 */
export async function confirm_when_destructive_actions_enabled(
  confirm_destructive_actions: boolean,
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>,
  options: ConfirmDialogOptions,
): Promise<boolean> {
  if (confirm_destructive_actions) {
    return confirm(options);
  }

  return true;
}

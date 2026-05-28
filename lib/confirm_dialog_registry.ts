import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

export type ConfirmDialogHandler = (
  options: ConfirmDialogOptions,
) => Promise<boolean>;

let registered_confirm: ConfirmDialogHandler | null = null;

/**
 * Registers the active confirm handler (used when RSC breaks context).
 */
export function register_confirm_dialog(
  handler: ConfirmDialogHandler | null,
): void {
  registered_confirm = handler;
}

/**
 * Returns the registered confirm handler, if any.
 */
export function get_registered_confirm_dialog(): ConfirmDialogHandler | null {
  return registered_confirm;
}

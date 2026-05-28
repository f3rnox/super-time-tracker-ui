import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

/**
 * Builds confirm dialog options for restoring a database backup.
 */
export function get_restore_db_confirm_dialog(): ConfirmDialogOptions {
  return {
    title: "Restore backup?",
    message:
      "This will replace your current time tracker data with the uploaded backup file. This cannot be undone.",
    confirmLabel: "Restore",
    variant: "danger",
  };
}

import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

/**
 * Builds confirm dialog options for deleting a note on an entry.
 */
export function get_delete_note_confirm_dialog(
  note_text: string,
): ConfirmDialogOptions {
  const trimmed = note_text.trim();
  const preview = trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
  const message =
    preview.length > 0 ? `Remove this note? "${preview}"` : "Remove this note?";

  return {
    title: "Delete note?",
    message,
    confirmLabel: "Delete",
    variant: "danger",
  };
}

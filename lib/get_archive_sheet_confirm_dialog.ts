import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

/**
 * Builds confirm dialog options for archiving a time sheet.
 */
export function get_archive_sheet_confirm_dialog(
  sheet_name: string,
): ConfirmDialogOptions {
  return {
    title: "Archive sheet?",
    message: `Archive "${sheet_name}"? It will be hidden from the tracker and Sheets hub. You can restore it from the archived section on the Sheets page.`,
    confirmLabel: "Archive",
    variant: "danger",
  };
}

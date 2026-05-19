/**
 * Returns whether a modal dialog is currently open in the document.
 */
export function is_modal_dialog_open(): boolean {
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null
}

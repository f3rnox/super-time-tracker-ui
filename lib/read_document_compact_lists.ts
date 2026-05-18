/**
 * Reads whether compact lists are enabled on the document element.
 */
export function read_document_compact_lists(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return (
    document.documentElement.getAttribute("data-compact-lists") === "true"
  );
}

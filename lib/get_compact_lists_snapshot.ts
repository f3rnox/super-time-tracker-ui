import { read_document_compact_lists } from "@/lib/read_document_compact_lists";

/**
 * Returns the compact lists snapshot from the document (client-only).
 */
export function get_compact_lists_snapshot(): boolean {
  return read_document_compact_lists();
}

/**
 * Returns the compact lists snapshot used during server rendering.
 */
export function get_compact_lists_server_snapshot(): boolean {
  return false;
}

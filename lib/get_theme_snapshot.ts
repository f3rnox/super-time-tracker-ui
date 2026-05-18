import { read_document_theme } from "@/lib/read_document_theme";
import { type Theme } from "@/lib/types/theme";

/**
 * Returns the theme snapshot read from the document (client-only).
 */
export function get_theme_snapshot(): Theme {
  return read_document_theme();
}

/**
 * Returns the theme snapshot used during server rendering.
 */
export function get_theme_server_snapshot(): Theme {
  return "dark";
}

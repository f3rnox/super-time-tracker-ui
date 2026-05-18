import { type Theme } from "@/lib/types/theme";

/**
 * Reads the theme currently applied on the document element.
 */
export function read_document_theme(): Theme {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

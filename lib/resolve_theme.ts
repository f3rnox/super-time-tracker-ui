import { type Theme } from "@/lib/types/theme";

/**
 * Resolves the initial theme from storage or system preference.
 */
export function resolve_theme(stored: Theme | null): Theme {
  if (stored !== null) {
    return stored;
  }

  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

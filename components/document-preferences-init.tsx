"use client";

import { useLayoutEffect } from "react";

import { apply_ui_preferences_dom_from_window } from "@/lib/apply_ui_preferences_dom_from_window";

/**
 * Applies stored UI preferences on mount and syncs them to cookies for SSR.
 */
export function DocumentPreferencesInit() {
  useLayoutEffect(() => {
    apply_ui_preferences_dom_from_window();
  }, []);

  return null;
}

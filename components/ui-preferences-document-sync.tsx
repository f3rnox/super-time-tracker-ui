"use client";

import { useEffect } from "react";

import { apply_ui_preferences_dom_from_window } from "@/lib/apply_ui_preferences_dom_from_window";
import { UI_PREFERENCES_APPLIED_EVENT } from "@/lib/ui_preferences_applied_event";

/**
 * Re-applies document-level UI preferences when storage is updated after sync.
 */
export function UiPreferencesDocumentSync(): null {
  useEffect(() => {
    const handle_applied = (): void => {
      apply_ui_preferences_dom_from_window();
    };

    window.addEventListener(UI_PREFERENCES_APPLIED_EVENT, handle_applied);

    return () => {
      window.removeEventListener(UI_PREFERENCES_APPLIED_EVENT, handle_applied);
    };
  }, []);

  return null;
}

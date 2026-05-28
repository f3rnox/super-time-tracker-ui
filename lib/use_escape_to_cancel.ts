"use client";

import { useEffect, useRef } from "react";

import { is_modal_dialog_open } from "@/lib/is_modal_dialog_open";

/**
 * Calls `on_cancel` when Escape is pressed, including while focus is in a field.
 */
export function use_escape_to_cancel(
  on_cancel: () => void,
  enabled: boolean = true,
): void {
  const on_cancel_ref = useRef(on_cancel);
  on_cancel_ref.current = on_cancel;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handle_key_down = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      if (is_modal_dialog_open()) {
        return;
      }

      event.preventDefault();
      on_cancel_ref.current();
    };

    document.addEventListener("keydown", handle_key_down);

    return () => {
      document.removeEventListener("keydown", handle_key_down);
    };
  }, [enabled]);
}

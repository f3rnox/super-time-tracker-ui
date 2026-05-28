"use client";

import { useEffect, useId, useRef } from "react";

import { KeyboardShortcutsContent } from "@/components/keyboard-shortcuts-content";
import { get_button_class_name } from "@/lib/get_button_class_name";
import { type KeyboardShortcutSection } from "@/lib/types/keyboard_shortcut";

interface KeyboardShortcutsDialogProps {
  sections: KeyboardShortcutSection[];
  on_close: () => void;
}

/**
 * Modal listing available keyboard shortcuts grouped by section.
 */
export function KeyboardShortcutsDialog({
  sections,
  on_close,
}: Readonly<KeyboardShortcutsDialogProps>) {
  const title_id = useId();
  const close_ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    close_ref.current?.focus();

    const handle_key_down = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        on_close();
      }
    };

    document.addEventListener("keydown", handle_key_down);

    return () => {
      document.removeEventListener("keydown", handle_key_down);
    };
  }, [on_close]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-5"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default border-0 bg-overlay p-0"
        aria-label="Dismiss dialog"
        onClick={on_close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title_id}
        className="relative z-1 w-full max-w-lg rounded-lg border border-panel-border bg-panel p-5 shadow-md"
      >
        <h2
          id={title_id}
          className="m-0 text-[1.1rem] font-[650] tracking-tight"
        >
          Keyboard shortcuts
        </h2>
        <div className="mt-4 max-h-[min(28rem,70vh)] overflow-y-auto pr-1">
          <KeyboardShortcutsContent sections={sections} />
        </div>
        <div className="mt-5 flex justify-end">
          <button
            ref={close_ref}
            type="button"
            className={get_button_class_name("primary")}
            onClick={on_close}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

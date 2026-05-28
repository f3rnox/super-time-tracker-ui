"use client";

import { useEffect, useId, useRef } from "react";

import { get_button_class_name } from "@/lib/get_button_class_name";
import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

interface ConfirmDialogProps {
  options: ConfirmDialogOptions;
  on_confirm: () => void;
  on_cancel: () => void;
}

/**
 * Themed modal dialog for destructive or important confirmations.
 */
export function ConfirmDialog({
  options,
  on_confirm,
  on_cancel,
}: Readonly<ConfirmDialogProps>) {
  const title_id = useId();
  const dialog_ref = useRef<HTMLDialogElement>(null);
  const confirm_ref = useRef<HTMLButtonElement>(null);
  const {
    cancelLabel = "Cancel",
    confirmLabel = "Confirm",
    message,
    title,
    variant = "default",
  } = options;
  const confirm_variant = variant === "danger" ? "danger" : "primary";

  useEffect(() => {
    const dialog = dialog_ref.current;

    if (dialog === null || dialog.open) {
      return;
    }

    dialog.showModal();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  useEffect(() => {
    confirm_ref.current?.focus();
  }, []);

  const handle_cancel = (): void => {
    dialog_ref.current?.close();
    on_cancel();
  };

  return (
    <dialog
      ref={dialog_ref}
      aria-labelledby={title_id}
      className="fixed inset-0 z-100 m-0 flex max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-5 backdrop:bg-overlay open:flex"
      onCancel={(event) => {
        event.preventDefault();
        handle_cancel();
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Dismiss dialog"
        className="absolute inset-0 z-0 cursor-default border-0 bg-transparent p-0"
        onClick={handle_cancel}
      />
      <div className="relative z-1 w-full max-w-md rounded-lg border border-panel-border bg-panel p-5 shadow-md">
        <h2
          id={title_id}
          className="m-0 text-[1.1rem] font-[650] tracking-tight"
        >
          {title}
        </h2>
        <p className="m-0 mt-2 text-[0.9rem] leading-relaxed text-muted">
          {message}
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className={get_button_class_name("ghost")}
            onClick={handle_cancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirm_ref}
            type="button"
            className={get_button_class_name(confirm_variant)}
            onClick={on_confirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

"use client";

import { useContext } from "react";

import {
  ConfirmDialogContext,
  type ConfirmDialogContextValue,
} from "@/lib/confirm_dialog_context";
import { get_registered_confirm_dialog } from "@/lib/confirm_dialog_registry";

/**
 * Returns the promise-based confirm dialog API from context.
 */
export function use_confirm_dialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);

  if (context !== null) {
    return context;
  }

  const registered = get_registered_confirm_dialog();

  if (registered !== null) {
    return { confirm: registered };
  }

  throw new Error(
    "use_confirm_dialog must be used within ConfirmDialogProvider",
  );
}

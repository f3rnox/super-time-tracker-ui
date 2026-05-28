"use client";

import { createContext } from "react";

import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

export interface ConfirmDialogContextValue {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

export const ConfirmDialogContext =
  createContext<ConfirmDialogContextValue | null>(null);

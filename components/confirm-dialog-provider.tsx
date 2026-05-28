"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  ConfirmDialogContext,
  type ConfirmDialogContextValue,
} from "@/lib/confirm_dialog_context";
import { register_confirm_dialog } from "@/lib/confirm_dialog_registry";
import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

interface ConfirmDialogRequest {
  options: ConfirmDialogOptions;
  resolve: (confirmed: boolean) => void;
}

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

/**
 * Provides a themed confirm dialog for the application tree.
 */
export function ConfirmDialogProvider({
  children,
}: Readonly<ConfirmDialogProviderProps>) {
  const [request, setRequest] = useState<ConfirmDialogRequest | null>(null);

  const confirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        setRequest({ options, resolve });
      });
    },
    [],
  );

  register_confirm_dialog(confirm);

  useEffect(() => {
    register_confirm_dialog(confirm);

    return () => {
      register_confirm_dialog(null);
    };
  }, [confirm]);

  const context_value = useMemo(
    (): ConfirmDialogContextValue => ({ confirm }),
    [confirm],
  );

  const close = (confirmed: boolean): void => {
    request?.resolve(confirmed);
    setRequest(null);
  };

  return (
    <ConfirmDialogContext.Provider value={context_value}>
      {children}
      {request === null ? null : (
        <ConfirmDialog
          options={request.options}
          on_confirm={() => close(true)}
          on_cancel={() => close(false)}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
}

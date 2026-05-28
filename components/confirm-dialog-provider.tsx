"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  get_registered_confirm_dialog,
  register_confirm_dialog,
} from "@/lib/confirm_dialog_registry";
import { type ConfirmDialogOptions } from "@/lib/types/confirm_dialog";

interface ConfirmDialogRequest {
  options: ConfirmDialogOptions;
  resolve: (confirmed: boolean) => void;
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(
  null,
);

/**
 * Returns the promise-based confirm dialog API from context.
 */
export function useConfirmDialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);

  if (context !== null) {
    return context;
  }

  const registered = get_registered_confirm_dialog();

  if (registered !== null) {
    return { confirm: registered };
  }

  throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
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

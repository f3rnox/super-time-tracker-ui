'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ConfirmDialogOptions } from '@/lib/types/confirm_dialog'

interface ConfirmDialogRequest {
  options: ConfirmDialogOptions
  resolve: (confirmed: boolean) => void
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

/**
 * Returns the promise-based confirm dialog API from context.
 */
export function use_confirm_dialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext)

  if (context === null) {
    throw new Error('use_confirm_dialog must be used within ConfirmDialogProvider')
  }

  return context
}

interface ConfirmDialogProviderProps {
  children: ReactNode
}

/**
 * Provides a themed confirm dialog for the application tree.
 */
export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [request, set_request] = useState<ConfirmDialogRequest | null>(null)

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      set_request({ options, resolve })
    })
  }, [])

  const close = (confirmed: boolean): void => {
    request?.resolve(confirmed)
    set_request(null)
  }

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {request !== null ? (
        <ConfirmDialog
          options={request.options}
          on_confirm={() => close(true)}
          on_cancel={() => close(false)}
        />
      ) : null}
    </ConfirmDialogContext.Provider>
  )
}

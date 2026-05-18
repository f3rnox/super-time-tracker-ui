'use client'

import { useEffect, useId, useRef } from 'react'

import { get_button_class_name } from '@/lib/get_button_class_name'
import { type ConfirmDialogOptions } from '@/lib/types/confirm_dialog'

interface ConfirmDialogProps {
  options: ConfirmDialogOptions
  on_confirm: () => void
  on_cancel: () => void
}

/**
 * Themed modal dialog for destructive or important confirmations.
 */
export function ConfirmDialog({
  options,
  on_confirm,
  on_cancel,
}: ConfirmDialogProps) {
  const title_id = useId()
  const confirm_ref = useRef<HTMLButtonElement>(null)
  const {
    cancelLabel = 'Cancel',
    confirmLabel = 'Confirm',
    message,
    title,
    variant = 'default',
  } = options
  const confirm_variant = variant === 'danger' ? 'danger' : 'primary'

  useEffect(() => {
    confirm_ref.current?.focus()

    const handle_key_down = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        on_cancel()
      }
    }

    document.addEventListener('keydown', handle_key_down)

    return () => {
      document.removeEventListener('keydown', handle_key_down)
    }
  }, [on_cancel])

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-5"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default border-0 bg-overlay p-0"
        aria-label="Dismiss dialog"
        onClick={on_cancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title_id}
        className="relative z-1 w-full max-w-md rounded-lg border border-panel-border bg-panel p-5 shadow-md"
      >
        <h2 id={title_id} className="m-0 text-[1.1rem] font-[650] tracking-tight">
          {title}
        </h2>
        <p className="m-0 mt-2 text-[0.9rem] leading-relaxed text-muted">{message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className={get_button_class_name('ghost')}
            onClick={on_cancel}
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
    </div>
  )
}

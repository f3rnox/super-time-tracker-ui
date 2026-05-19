'use client'

import { useCallback } from 'react'

import { use_confirm_dialog } from '@/components/confirm-dialog-provider'
import { get_check_out_confirm_dialog } from '@/lib/get_check_out_confirm_dialog'
import { use_confirm_before_checkout } from '@/lib/use_confirm_before_checkout'

/**
 * Returns a check-out handler that respects the confirm-before-checkout preference.
 */
export function use_check_out_action(
  on_check_out: (at?: string) => void,
): (at?: string) => Promise<void> {
  const { confirm } = use_confirm_dialog()
  const confirm_before_checkout = use_confirm_before_checkout()

  return useCallback(
    async (at?: string): Promise<void> => {
      if (confirm_before_checkout) {
        const confirmed = await confirm(get_check_out_confirm_dialog(at))

        if (!confirmed) {
          return
        }
      }

      on_check_out(at)
    },
    [confirm, confirm_before_checkout, on_check_out],
  )
}

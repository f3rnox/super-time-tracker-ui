'use client'

import { use_confirm_dialog } from '@/components/confirm-dialog-provider'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_check_out_confirm_dialog } from '@/lib/get_check_out_confirm_dialog'
import { prompt_check_out_at } from '@/lib/prompt_check_out_at'
import { use_confirm_before_checkout } from '@/lib/use_confirm_before_checkout'

interface CheckoutButtonGroupProps {
  in_bar?: boolean
  is_pending: boolean
  on_check_out: (at?: string) => void
}

const group_button_class = `${get_button_class_name('danger')} rounded-none first:rounded-l-[0.65rem] last:rounded-r-[0.65rem] not-first:-ml-px not-first:min-w-12 not-first:border-l not-first:border-l-[color-mix(in_srgb,var(--danger-text)_30%,var(--background))] max-[860px]:flex-1 max-[860px]:basis-1/2`

/**
 * Check out now or at a natural-language time in a joined button group.
 */
export function CheckoutButtonGroup({
  in_bar = false,
  is_pending,
  on_check_out,
}: CheckoutButtonGroupProps) {
  const { confirm } = use_confirm_dialog()
  const confirm_before_checkout = use_confirm_before_checkout()

  const check_out_with_confirm = async (at?: string): Promise<void> => {
    if (confirm_before_checkout) {
      const confirmed = await confirm(get_check_out_confirm_dialog(at))

      if (!confirmed) {
        return
      }
    }

    on_check_out(at)
  }

  const handle_at = (): void => {
    const at = prompt_check_out_at()

    if (at === null) {
      return
    }

    void check_out_with_confirm(at)
  }

  return (
    <div
      className={`inline-flex shrink-0 ${in_bar ? 'min-w-0 max-[860px]:w-full' : 'min-w-30 max-[860px]:w-full'}`}
    >
      <button
        type="button"
        className={group_button_class}
        disabled={is_pending}
        onClick={() => void check_out_with_confirm()}
      >
        Check out
      </button>
      <button
        type="button"
        className={group_button_class}
        disabled={is_pending}
        title="Check out at a specific time"
        onClick={handle_at}
      >
        @
      </button>
    </div>
  )
}

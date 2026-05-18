'use client'

import { get_button_class_name } from '@/lib/get_button_class_name'
import { prompt_check_out_at } from '@/lib/prompt_check_out_at'

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
  const handle_at = (): void => {
    const at = prompt_check_out_at()

    if (at === null) {
      return
    }

    on_check_out(at)
  }

  return (
    <div
      className={`inline-flex shrink-0 ${in_bar ? 'min-w-0 max-[860px]:w-full' : 'min-w-30 max-[860px]:w-full'}`}
    >
      <button
        type="button"
        className={group_button_class}
        disabled={is_pending}
        onClick={() => on_check_out()}
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

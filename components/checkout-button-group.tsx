'use client'

import { get_button_class_name } from '@/lib/get_button_class_name'
import { prompt_check_out_at } from '@/lib/prompt_check_out_at'

interface CheckoutButtonGroupProps {
  in_bar?: boolean
  is_pending: boolean
  on_start_checkout: (at?: string) => void
}

const group_button_class = `${get_button_class_name('danger-solid')} rounded-none first:rounded-l-[0.65rem] last:rounded-r-[0.65rem] not-first:-ml-px not-first:min-w-12 not-first:border-l not-first:border-l-[color-mix(in_srgb,#ffffff_30%,var(--danger-solid))] min-[561px]:px-2.5 min-[561px]:py-2 min-[561px]:text-[0.9rem] max-[560px]:flex-1 max-[560px]:basis-1/2`

/**
 * Triggers checkout now or at a natural-language time, opening the checkout form.
 */
export function CheckoutButtonGroup({
  in_bar = false,
  is_pending,
  on_start_checkout,
}: CheckoutButtonGroupProps) {
  const handle_at = (): void => {
    const at = prompt_check_out_at()

    if (at === null) {
      return
    }

    on_start_checkout(at)
  }

  return (
    <div
      className={`inline-flex min-w-0 max-w-full ${in_bar ? 'max-[560px]:w-full' : 'min-w-30 max-[560px]:w-full'}`}
    >
      <button
        type="button"
        className={group_button_class}
        disabled={is_pending}
        onClick={() => on_start_checkout()}
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

'use client'

import { prompt_check_out_at } from '@/lib/prompt_check_out_at'

interface CheckoutButtonGroupProps {
  is_pending: boolean
  on_check_out: (at?: string) => void
}

/**
 * Check out now or at a natural-language time in a joined button group.
 */
export function CheckoutButtonGroup({
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
    <div className="button-group active-panel__checkout-group">
      <button
        type="button"
        className="button button--danger"
        disabled={is_pending}
        onClick={() => on_check_out()}
      >
        Check out
      </button>
      <button
        type="button"
        className="button button--danger"
        disabled={is_pending}
        title="Check out at a specific time"
        onClick={handle_at}
      >
        @
      </button>
    </div>
  )
}

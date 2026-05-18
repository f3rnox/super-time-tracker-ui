'use client'

import { useState } from 'react'

import { CheckInForm, type CheckInFormValues } from '@/components/check-in-form'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { use_check_in_form_collapsed } from '@/lib/use_check_in_form_collapsed'

interface CheckInFormCollapsibleProps {
  known_tags: string[]
  is_pending: boolean
  on_submit: (values: CheckInFormValues) => void
}

/**
 * Renders the check-in form, collapsible to a button when the preference is set.
 */
export function CheckInFormCollapsible({
  known_tags,
  is_pending,
  on_submit,
}: CheckInFormCollapsibleProps) {
  const should_collapse_by_default = use_check_in_form_collapsed()
  const [is_expanded, set_is_expanded] = useState(!should_collapse_by_default)

  if (should_collapse_by_default && !is_expanded) {
    return (
      <button
        type="button"
        className={`${get_button_class_name('primary')} self-start`}
        disabled={is_pending}
        onClick={() => set_is_expanded(true)}
      >
        Check in
      </button>
    )
  }

  return (
    <CheckInForm
      known_tags={known_tags}
      is_pending={is_pending}
      on_submit={(values) => {
        on_submit(values)

        if (should_collapse_by_default) {
          set_is_expanded(false)
        }
      }}
    />
  )
}

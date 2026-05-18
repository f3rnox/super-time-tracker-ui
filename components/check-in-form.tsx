'use client'

import { type FormEvent, useState } from 'react'

export interface CheckInFormValues {
  description: string
  at?: string
}

interface CheckInFormProps {
  on_submit: (values: CheckInFormValues) => void
  is_pending: boolean
}

/**
 * Form for starting a new time sheet entry.
 */
export function CheckInForm({ on_submit, is_pending }: CheckInFormProps) {
  const [description, set_description] = useState('')
  const [at, set_at] = useState('')

  const handle_submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed_description = description.trim()

    if (trimmed_description.length === 0) {
      return
    }

    const trimmed_at = at.trim()

    on_submit({
      description: trimmed_description,
      ...(trimmed_at.length > 0 ? { at: trimmed_at } : {}),
    })
    set_description('')
    set_at('')
  }

  return (
    <form className="check-in-form" onSubmit={handle_submit}>
      <label className="check-in-form__label" htmlFor="check-in-description">
        What are you working on?
      </label>
      <div className="check-in-form__row">
        <input
          id="check-in-description"
          className="input"
          value={description}
          onChange={(event) => set_description(event.target.value)}
          placeholder="e.g. crafting something @design"
          disabled={is_pending}
          autoFocus
        />
        <button
          type="submit"
          className="button button--primary"
          disabled={is_pending || description.trim().length === 0}
        >
          Check in
        </button>
      </div>
      <label className="check-in-form__label" htmlFor="check-in-at">
        Start time{' '}
        <span className="check-in-form__hint">(optional, natural language)</span>
      </label>
      <input
        id="check-in-at"
        className="input"
        value={at}
        onChange={(event) => set_at(event.target.value)}
        placeholder="e.g. 30 minutes ago"
        disabled={is_pending}
      />
    </form>
  )
}

'use client'

import { type FormEvent, useState } from 'react'

interface CheckInFormProps {
  on_submit: (description: string) => void
  is_pending: boolean
}

/**
 * Form for starting a new time sheet entry.
 */
export function CheckInForm({ on_submit, is_pending }: CheckInFormProps) {
  const [description, set_description] = useState('')

  const handle_submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = description.trim()

    if (trimmed.length === 0) {
      return
    }

    on_submit(trimmed)
    set_description('')
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
    </form>
  )
}

'use client'

import { useEffect, useRef } from 'react'

interface CheckboxProps {
  checked: boolean
  disabled?: boolean
  indeterminate?: boolean
  nested?: boolean
  on_change: () => void
  label?: string
  aria_label?: string
  className?: string
}

/**
 * Accessible custom-styled checkbox control.
 */
export function Checkbox({
  checked,
  disabled = false,
  indeterminate = false,
  nested = false,
  on_change,
  label,
  aria_label,
  className,
}: CheckboxProps) {
  const input_ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (input_ref.current !== null) {
      input_ref.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const root_class = className === undefined ? 'checkbox' : `checkbox ${className}`

  const control = (
    <>
      <input
        ref={input_ref}
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        disabled={disabled}
        aria-label={nested && label === undefined ? aria_label : undefined}
        onChange={on_change}
      />
      <span className="checkbox__control" aria-hidden="true" />
    </>
  )

  if (nested) {
    return <span className={root_class}>{control}</span>
  }

  return (
    <label className={root_class}>
      {control}
      {label !== undefined ? (
        <span className="checkbox__label">{label}</span>
      ) : null}
    </label>
  )
}

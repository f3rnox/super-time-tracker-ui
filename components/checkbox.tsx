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

const root_base =
  'inline-flex shrink-0 cursor-pointer items-center gap-1.5'

const control_class =
  'relative block h-[0.85rem] w-[0.85rem] shrink-0 rounded-[0.2rem] border border-panel-border bg-input-bg box-border transition-[background-color,border-color] duration-150 peer-checked:border-accent peer-checked:bg-accent peer-indeterminate:border-accent peer-indeterminate:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-input-focus-border peer-focus-visible:outline-offset-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-55 after:absolute after:left-1/2 after:top-[44%] after:hidden after:h-[0.28rem] after:w-[0.45rem] after:-translate-x-1/2 after:-translate-y-[60%] after:rotate-[-45deg] after:border-b-[1.5px] after:border-l-[1.5px] after:border-accent-text-on after:content-[""] peer-checked:after:block peer-indeterminate:after:top-1/2 peer-indeterminate:after:block peer-indeterminate:after:h-[1.5px] peer-indeterminate:after:w-[0.45rem] peer-indeterminate:after:-translate-x-1/2 peer-indeterminate:after:-translate-y-1/2 peer-indeterminate:after:rotate-0 peer-indeterminate:after:border-0 peer-indeterminate:after:bg-accent-text-on'

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

  const root_class =
    className === undefined ? root_base : `${root_base} ${className}`

  const control = (
    <>
      <input
        ref={input_ref}
        type="checkbox"
        className="peer absolute m-0 h-px w-px overflow-hidden opacity-0"
        checked={checked}
        disabled={disabled}
        aria-label={nested && label === undefined ? aria_label : undefined}
        onChange={on_change}
      />
      <span className={control_class} aria-hidden="true" />
    </>
  )

  if (nested) {
    return <span className={root_class}>{control}</span>
  }

  return (
    <label className={root_class}>
      {control}
      {label !== undefined ? (
        <span className="select-none text-[0.8rem] leading-tight text-muted">
          {label}
        </span>
      ) : null}
    </label>
  )
}

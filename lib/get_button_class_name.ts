export type ButtonVariant = 'primary' | 'ghost' | 'danger'
export type ButtonSize = 'default' | 'small'

/**
 * Returns Tailwind classes for themed buttons.
 */
export function get_button_class_name(
  variant: ButtonVariant = 'ghost',
  size: ButtonSize = 'default',
): string {
  const base =
    'cursor-pointer rounded-[0.65rem] border border-transparent font-inherit font-semibold disabled:cursor-not-allowed disabled:opacity-55'
  const sizes: Record<ButtonSize, string> = {
    default: 'px-3.5 py-2.5',
    small: 'px-2.5 py-1.5 text-xs',
  }
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-accent-text-on',
    ghost: 'border-panel-border bg-ghost-bg text-inherit',
    danger: 'border-danger-border bg-danger-soft text-danger',
  }

  return `${base} ${sizes[size]} ${variants[variant]}`
}

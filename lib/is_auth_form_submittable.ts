export interface AuthFormValues {
  email: string
  password: string
  password_confirm: string
  is_sign_up: boolean
}

/**
 * Returns whether every required auth field is filled and valid for submit.
 */
export function is_auth_form_submittable(values: AuthFormValues): boolean {
  const trimmed_email = values.email.trim()
  const password_filled = values.password.length > 0
  const email_filled = trimmed_email.length > 0

  if (!email_filled || !password_filled) {
    return false
  }

  if (values.password.length < 8) {
    return false
  }

  if (!values.is_sign_up) {
    return true
  }

  const confirm_filled = values.password_confirm.length > 0

  if (!confirm_filled) {
    return false
  }

  return values.password === values.password_confirm
}

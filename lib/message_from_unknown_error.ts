/**
 * Returns a safe string message for an unknown thrown value.
 */
export function message_from_unknown_error(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}

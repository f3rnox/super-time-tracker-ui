/**
 * Formats an unknown thrown value for display.
 */
export function format_unknown_error(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error === null || error === undefined) {
    return "Unknown error";
  }

  if (
    typeof error === "number" ||
    typeof error === "boolean" ||
    typeof error === "bigint" ||
    typeof error === "symbol"
  ) {
    return String(error);
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

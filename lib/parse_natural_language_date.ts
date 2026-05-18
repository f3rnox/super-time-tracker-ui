import parseDate, { InvalidInputError } from "time-speak";

/**
 * Parses a natural-language time expression into a Date.
 */
export function parse_natural_language_date(expression: string): Date {
  const trimmed = expression.trim();

  if (trimmed.length === 0) {
    throw new Error("Time expression is required");
  }

  try {
    const parsed = parseDate(trimmed);
    return new Date(+parsed);
  } catch (error: unknown) {
    if (error instanceof InvalidInputError) {
      throw new Error(`Could not parse time: ${trimmed}`, { cause: error });
    }

    throw error;
  }
}

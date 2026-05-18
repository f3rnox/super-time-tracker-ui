import { NextResponse } from "next/server";

/**
 * Builds a JSON error response from an unknown thrown value.
 */
export function api_error_response(error: unknown, status = 400): NextResponse {
  const message = error instanceof Error ? error.message : String(error);

  return NextResponse.json({ error: message }, { status });
}

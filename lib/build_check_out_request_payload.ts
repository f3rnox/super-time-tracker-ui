import { type CheckOutOptions } from "@/lib/types/check_out_options";

export interface CheckOutRequestPayload {
  sheetName: string;
  at?: string;
  note?: string;
}

/**
 * Builds the JSON body for POST /api/out from sheet name and checkout options.
 */
export function build_check_out_request_payload(
  sheet_name: string,
  options?: CheckOutOptions,
): CheckOutRequestPayload {
  const payload: CheckOutRequestPayload = { sheetName: sheet_name };
  const trimmed_at = options?.at?.trim();
  const trimmed_note = options?.note?.trim();

  if (trimmed_at !== undefined && trimmed_at.length > 0) {
    payload.at = trimmed_at;
  }

  if (trimmed_note !== undefined && trimmed_note.length > 0) {
    payload.note = trimmed_note;
  }

  return payload;
}

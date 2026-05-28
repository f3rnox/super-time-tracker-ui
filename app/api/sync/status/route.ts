import { NextResponse } from "next/server";

import { api_error_response } from "@/lib/api_error_response";
import { get_cloud_sync_status } from "@/lib/get_cloud_sync_status";

/**
 * Returns the cloud sync state for the signed-in user.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const status = await get_cloud_sync_status();

    return NextResponse.json(status);
  } catch (error: unknown) {
    return api_error_response(error, 500);
  }
}

import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { sync_tracker_db_on_load } from '@/lib/sync_tracker_db_on_load'

/**
 * Merges local and cloud tracker data on page load.
 */
export async function POST(): Promise<NextResponse> {
  try {
    const result = await sync_tracker_db_on_load()

    return NextResponse.json({ ok: true, synced: result.synced })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}

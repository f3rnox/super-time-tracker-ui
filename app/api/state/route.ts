import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { get_tracker_state } from '@/lib/get_tracker_state'

/**
 * Returns the current tracker state snapshot.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const state = await get_tracker_state()
    return NextResponse.json(state)
  } catch (error: unknown) {
    return api_error_response(error)
  }
}

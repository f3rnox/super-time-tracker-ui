import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { get_tracker_state } from '@/lib/get_tracker_state'
import { merge_adjacent_entries } from '@/lib/merge_adjacent_entries'
import { type MergeEntryDirection } from '@/lib/get_mergeable_entry_neighbors'

interface MergeEntryBody {
  sheetName?: string
  entryId?: number
  direction?: string
}

const is_merge_direction = (value: string): value is MergeEntryDirection =>
  value === 'previous' || value === 'next'

/**
 * Merges an entry with a touching previous or next neighbor.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as MergeEntryBody
    const sheet_name = body.sheetName?.trim() ?? ''
    const entry_id = body.entryId
    const direction_raw = body.direction?.trim() ?? ''

    if (sheet_name.length === 0) {
      return api_error_response(new Error('Sheet name is required'))
    }

    if (entry_id === undefined || !Number.isFinite(entry_id)) {
      return api_error_response(new Error('Entry id is required'))
    }

    if (!is_merge_direction(direction_raw)) {
      return api_error_response(new Error('Merge direction must be previous or next'))
    }

    await merge_adjacent_entries({
      sheet_name,
      entry_id,
      direction: direction_raw,
    })

    const state = await get_tracker_state()
    return NextResponse.json(state)
  } catch (error: unknown) {
    return api_error_response(error)
  }
}

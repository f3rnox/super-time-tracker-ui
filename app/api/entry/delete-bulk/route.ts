import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { delete_entries } from '@/lib/delete_entries'
import { get_tracker_state } from '@/lib/get_tracker_state'

interface DeleteEntryRefBody {
  sheetName?: string
  entryId?: number
}

interface DeleteEntriesBody {
  entries?: DeleteEntryRefBody[]
}

/**
 * Deletes multiple time sheet entries across sheets.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as DeleteEntriesBody
    const raw_entries = body.entries ?? []

    if (raw_entries.length === 0) {
      return api_error_response(new Error('No entries selected'))
    }

    const entries = raw_entries.map((entry, index) => {
      const sheet_name = entry.sheetName?.trim() ?? ''
      const entry_id = entry.entryId

      if (sheet_name.length === 0) {
        throw new Error(`Entry ${index + 1} is missing a sheet name`)
      }

      if (entry_id === undefined || !Number.isFinite(entry_id)) {
        throw new Error(`Entry ${index + 1} is missing an entry id`)
      }

      return {
        sheet_name,
        entry_id,
      }
    })

    await delete_entries({ entries })

    const state = await get_tracker_state()
    return NextResponse.json(state)
  } catch (error: unknown) {
    return api_error_response(error)
  }
}

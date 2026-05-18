import { NextResponse } from 'next/server'

import { api_error_response } from '@/lib/api_error_response'
import { collect_tag_stats } from '@/lib/collect_tag_stats'
import { merge_tags_across_db } from '@/lib/merge_tags_across_db'
import { read_db } from '@/lib/read_db'
import { rename_tag_across_db } from '@/lib/rename_tag_across_db'

interface RenameTagBody {
  action: 'rename'
  fromTag?: string
  toTag?: string
}

interface MergeTagsBody {
  action: 'merge'
  sourceTags?: string[]
  targetTag?: string
}

type TagMutationBody = RenameTagBody | MergeTagsBody

/**
 * Returns tag usage statistics for the tag management screen.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const db = await read_db()

    return NextResponse.json({ tags: collect_tag_stats(db) })
  } catch (error: unknown) {
    return api_error_response(error, 500)
  }
}

/**
 * Renames or merges tags across all entries.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as TagMutationBody

    if (body.action === 'rename') {
      const from_tag = body.fromTag?.trim() ?? ''
      const to_tag = body.toTag?.trim() ?? ''

      if (from_tag.length === 0 || to_tag.length === 0) {
        return api_error_response(new Error('Both tag names are required.'))
      }

      const result = await rename_tag_across_db(from_tag, to_tag)

      return NextResponse.json(result)
    }

    if (body.action === 'merge') {
      const source_tags = body.sourceTags ?? []
      const target_tag = body.targetTag?.trim() ?? ''

      if (source_tags.length === 0 || target_tag.length === 0) {
        return api_error_response(
          new Error('Source tags and a target tag are required.'),
        )
      }

      const result = await merge_tags_across_db(source_tags, target_tag)

      return NextResponse.json(result)
    }

    return api_error_response(new Error('Unknown tag action.'))
  } catch (error: unknown) {
    return api_error_response(error, 400)
  }
}

import {
  merge_tags_across_db,
  type MergeTagsAcrossDbResult,
} from '@/lib/merge_tags_across_db'
import { tags_are_equal } from '@/lib/tags_are_equal'

/**
 * Renames a tag on every entry that uses it.
 */
export async function rename_tag_across_db(
  from_tag: string,
  to_tag: string,
): Promise<MergeTagsAcrossDbResult> {
  if (tags_are_equal(from_tag, to_tag)) {
    throw new Error('Choose a different name for the tag.')
  }

  return merge_tags_across_db([from_tag], to_tag)
}

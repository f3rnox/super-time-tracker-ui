export interface EntrySearchQueryFields {
  sheetName: string
  description: string
  tags: string[]
  noteTexts: string[]
}

export interface EntrySearchQueryMatch {
  matches: boolean
  noteSnippet: string | null
}

const max_snippet_length = 120

/**
 * Matches an entry against a case-insensitive full-text search query.
 */
export function match_entry_search_query(
  fields: EntrySearchQueryFields,
  query: string,
): EntrySearchQueryMatch {
  const normalized_query = query.trim().toLowerCase()

  if (normalized_query.length === 0) {
    return { matches: true, noteSnippet: null }
  }

  const description_match = fields.description.toLowerCase().includes(normalized_query)
  const sheet_match = fields.sheetName.toLowerCase().includes(normalized_query)
  const tag_match = fields.tags.some((tag) =>
    tag.toLowerCase().includes(normalized_query),
  )

  if (description_match || sheet_match || tag_match) {
    return { matches: true, noteSnippet: null }
  }

  for (const note_text of fields.noteTexts) {
    const normalized_note = note_text.toLowerCase()

    if (!normalized_note.includes(normalized_query)) {
      continue
    }

    return {
      matches: true,
      noteSnippet: build_note_snippet(note_text, normalized_query),
    }
  }

  return { matches: false, noteSnippet: null }
}

function build_note_snippet(note_text: string, normalized_query: string): string {
  const normalized_note = note_text.toLowerCase()
  const match_index = normalized_note.indexOf(normalized_query)

  if (match_index < 0) {
    return note_text.slice(0, max_snippet_length)
  }

  const start = Math.max(0, match_index - 40)
  const end = Math.min(note_text.length, match_index + normalized_query.length + 40)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < note_text.length ? '…' : ''

  return `${prefix}${note_text.slice(start, end)}${suffix}`
}

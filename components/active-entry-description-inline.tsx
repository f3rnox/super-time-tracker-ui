'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'

import { TagAutocompleteInput } from '@/components/tag-autocomplete-input'
import { build_resume_description } from '@/lib/build_resume_description'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { use_escape_to_cancel } from '@/lib/use_escape_to_cancel'
import { type SerializedEntry } from '@/lib/types/tracker_state'

interface ActiveEntryDescriptionInlineProps {
  entry: SerializedEntry
  known_tags: string[]
  is_pending: boolean
  on_save: (description: string) => void
  on_cancel: () => void
}

/**
 * Inline description editor for the active entry panel heading.
 */
export function ActiveEntryDescriptionInline({
  entry,
  known_tags,
  is_pending,
  on_save,
  on_cancel,
}: ActiveEntryDescriptionInlineProps) {
  const initial_description = useMemo(
    () => build_resume_description(entry.description, entry.tags),
    [entry.description, entry.id, entry.tags],
  )
  const [description, set_description] = useState(initial_description)

  useEffect(() => {
    set_description(build_resume_description(entry.description, entry.tags))
  }, [entry.description, entry.id, entry.sheetName, entry.tags])

  use_escape_to_cancel(on_cancel)

  const handle_submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const trimmed = description.trim()

    if (trimmed === initial_description.trim()) {
      on_cancel()
      return
    }

    on_save(trimmed)
  }

  return (
    <form
      className="flex min-w-0 flex-1 flex-col gap-2"
      onSubmit={handle_submit}
    >
      <TagAutocompleteInput
        id={`active-entry-description-${entry.id}`}
        value={description}
        known_tags={known_tags}
        placeholder="e.g. crafting something @design"
        disabled={is_pending}
        autoFocus
        on_change={set_description}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className={get_button_class_name('primary', 'small')}
          disabled={is_pending || description.trim() === initial_description.trim()}
        >
          Save
        </button>
        <button
          type="button"
          className={get_button_class_name('ghost', 'small')}
          disabled={is_pending}
          onClick={on_cancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

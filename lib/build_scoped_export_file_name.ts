import { has_entry_export_filters } from '@/lib/has_entry_export_filters'
import { type EntryExportFilters } from '@/lib/types/entry_export'

export type ExportFileFormat = 'json' | 'csv' | 'markdown'

/**
 * Builds a download file name for a scoped or full database export.
 */
export function build_scoped_export_file_name(
  format: ExportFileFormat,
  filters: EntryExportFilters,
): string {
  const extension = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'md'
  const scope_slug = build_export_scope_slug(filters)

  if (scope_slug.length === 0) {
    return `super-time-tracker-export.${extension}`
  }

  return `super-time-tracker-export-${scope_slug}.${extension}`
}

function build_export_scope_slug(filters: EntryExportFilters): string {
  if (!has_entry_export_filters(filters)) {
    return ''
  }

  const parts: string[] = []

  if (filters.sheetName.trim().length > 0) {
    parts.push(slugify(filters.sheetName))
  }

  if (filters.tag.trim().length > 0) {
    parts.push(`tag-${slugify(filters.tag)}`)
  }

  if (filters.fromDate.trim().length > 0 || filters.toDate.trim().length > 0) {
    const from = filters.fromDate.trim() || 'start'
    const to = filters.toDate.trim() || 'end'
    parts.push(`${from}-to-${to}`)
  }

  return parts.join('-').slice(0, 80)
}

function slugify(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')

  return normalized.length > 0 ? normalized : 'scope'
}

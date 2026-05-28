'use client'

import { useMemo, useState } from 'react'

import { SettingsPageLayout } from '@/components/settings-page-layout'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { type JSONTimeTrackerDB } from '@/lib/types'

interface ExportSettingsViewProps {
  db: JSONTimeTrackerDB
}

type ExportFormat = 'json' | 'csv' | 'markdown'

/**
 * Settings page for exporting tracker data as JSON, CSV, or Markdown.
 */
export function ExportSettingsView({ db }: ExportSettingsViewProps) {
  const [status_message, set_status_message] = useState<string | null>(null)
  const [error, set_error] = useState<string | null>(null)

  const entry_count = useMemo(() => {
    return db.sheets.reduce((total, sheet) => total + sheet.entries.length, 0)
  }, [db.sheets])

  const handle_export = (format: ExportFormat): void => {
    set_error(null)
    set_status_message(null)

    try {
      const file_content =
        format === 'json'
          ? build_json_export(db)
          : format === 'csv'
            ? build_csv_export(db)
            : build_markdown_export(db)
      const file_name = `super-time-tracker-export.${get_export_extension(format)}`
      const mime_type = get_export_mime_type(format)

      download_file(file_name, file_content, mime_type)
      set_status_message(`Downloaded ${file_name}`)
    } catch (export_error: unknown) {
      set_error(
        export_error instanceof Error
          ? export_error.message
          : String(export_error),
      )
    }
  }

  return (
    <SettingsPageLayout
      breadcrumb={{
        current: 'Export',
        parent: { label: 'Settings', href: '/settings' },
      }}
      title="Export"
      description="Export your tracker database to JSON, CSV, or Markdown."
    >
      <ul
        className="m-0 flex w-full list-none flex-col gap-2 p-0"
        aria-label="Export settings"
      >
        <li className="rounded-md border border-panel-border bg-panel p-3.5 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-[0.95rem] font-semibold">Database export</h2>
            <p className="m-0 text-[0.8rem] leading-snug text-muted">
              {db.sheets.length} sheets and {entry_count} entries ready to export.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={get_button_class_name('ghost', 'small')}
              onClick={() => handle_export('json')}
            >
              Export JSON
            </button>
            <button
              type="button"
              className={get_button_class_name('ghost', 'small')}
              onClick={() => handle_export('csv')}
            >
              Export CSV
            </button>
            <button
              type="button"
              className={get_button_class_name('ghost', 'small')}
              onClick={() => handle_export('markdown')}
            >
              Export Markdown
            </button>
          </div>
          {status_message !== null ? (
            <p className="m-0 mt-2 text-[0.82rem] text-accent">{status_message}</p>
          ) : null}
          {error !== null ? (
            <p className="m-0 mt-2 text-[0.82rem] text-danger">{error}</p>
          ) : null}
        </li>
      </ul>
    </SettingsPageLayout>
  )
}

function build_json_export(db: JSONTimeTrackerDB): string {
  return JSON.stringify(db, null, 2)
}

function build_csv_export(db: JSONTimeTrackerDB): string {
  const header = [
    'sheet_name',
    'entry_id',
    'description',
    'tags',
    'start_iso',
    'end_iso',
    'duration_minutes',
    'note_count',
    'notes',
  ]
  const rows = db.sheets.flatMap((sheet) => {
    return sheet.entries.map((entry) => {
      const start_iso = new Date(entry.start).toISOString()
      const end_iso = entry.end === null ? '' : new Date(entry.end).toISOString()
      const duration_minutes =
        entry.end === null ? '' : String(Math.max(0, entry.end - entry.start) / 60000)
      const notes = entry.notes.map((note) => note.text).join(' | ')

      return [
        sheet.name,
        String(entry.id),
        entry.description,
        entry.tags.join(' '),
        start_iso,
        end_iso,
        duration_minutes,
        String(entry.notes.length),
        notes,
      ]
        .map(escape_csv_cell)
        .join(',')
    })
  })

  return [header.join(','), ...rows].join('\n')
}

function build_markdown_export(db: JSONTimeTrackerDB): string {
  const lines: string[] = []
  const exported_at = new Date().toISOString()
  const total_entries = db.sheets.reduce((total, sheet) => total + sheet.entries.length, 0)

  lines.push('# super-time-tracker export')
  lines.push('')
  lines.push(`- Exported at: ${exported_at}`)
  lines.push(`- Active sheet: ${db.activeSheetName ?? 'none'}`)
  lines.push(`- Sheets: ${db.sheets.length}`)
  lines.push(`- Entries: ${total_entries}`)
  lines.push('')

  for (const sheet of db.sheets) {
    lines.push(`## ${sheet.name}`)
    lines.push('')
    lines.push(`- Active entry ID: ${sheet.activeEntryID ?? 'none'}`)
    lines.push(`- Entries: ${sheet.entries.length}`)
    lines.push('')

    if (sheet.entries.length === 0) {
      lines.push('_No entries_')
      lines.push('')
      continue
    }

    lines.push('| ID | Description | Tags | Start | End | Duration | Notes |')
    lines.push('| --- | --- | --- | --- | --- | --- | --- |')

    for (const entry of sheet.entries) {
      const start = new Date(entry.start).toISOString()
      const end = entry.end === null ? 'running' : new Date(entry.end).toISOString()
      const duration =
        entry.end === null
          ? 'running'
          : `${Math.max(0, entry.end - entry.start) / 60000} min`
      const tags = entry.tags.length === 0 ? '-' : entry.tags.map((tag) => `@${tag}`).join(' ')
      const notes = entry.notes.length === 0 ? '-' : entry.notes.map((note) => note.text).join(' / ')

      lines.push(
        `| ${entry.id} | ${escape_markdown_cell(entry.description)} | ${escape_markdown_cell(tags)} | ${start} | ${end} | ${duration} | ${escape_markdown_cell(notes)} |`,
      )
    }

    lines.push('')
  }

  return lines.join('\n')
}

function escape_csv_cell(value: string): string {
  const normalized = value.replaceAll('"', '""')
  return `"${normalized}"`
}

function escape_markdown_cell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function get_export_extension(format: ExportFormat): string {
  if (format === 'json') {
    return 'json'
  }

  if (format === 'csv') {
    return 'csv'
  }

  return 'md'
}

function get_export_mime_type(format: ExportFormat): string {
  if (format === 'json') {
    return 'application/json'
  }

  if (format === 'csv') {
    return 'text/csv;charset=utf-8'
  }

  return 'text/markdown;charset=utf-8'
}

function download_file(file_name: string, content: string, mime_type: string): void {
  const blob = new Blob([content], { type: mime_type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = file_name
  link.click()

  URL.revokeObjectURL(url)
}

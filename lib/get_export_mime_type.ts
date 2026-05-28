import { type ExportFileFormat } from '@/lib/build_scoped_export_file_name'

/**
 * Returns the MIME type for an export file format.
 */
export function get_export_mime_type(format: ExportFileFormat): string {
  if (format === 'json') {
    return 'application/json'
  }

  if (format === 'csv') {
    return 'text/csv;charset=utf-8'
  }

  return 'text/markdown;charset=utf-8'
}

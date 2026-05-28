/**
 * Triggers a browser download for text content.
 */
export function download_text_file(
  file_name: string,
  content: string,
  mime_type: string,
): void {
  const blob = new Blob([content], { type: mime_type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = file_name
  link.click()

  URL.revokeObjectURL(url)
}

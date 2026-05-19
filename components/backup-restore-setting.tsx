'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { push_tracker_db_cloud_after_change } from '@/lib/push_tracker_db_cloud_after_change'

import { use_confirm_dialog } from '@/components/confirm-dialog-provider'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { get_restore_db_confirm_dialog } from '@/lib/get_restore_db_confirm_dialog'

interface BackupRestoreSettingProps {
  db_path: string
}

/**
 * Downloads or restores the tracker database from Settings.
 */
export function BackupRestoreSetting({ db_path }: BackupRestoreSettingProps) {
  const router = useRouter()
  const { confirm } = use_confirm_dialog()
  const file_input_ref = useRef<HTMLInputElement>(null)
  const [error, set_error] = useState<string | null>(null)
  const [status_message, set_status_message] = useState<string | null>(null)
  const [is_downloading, set_is_downloading] = useState(false)
  const [is_restoring, set_is_restoring] = useState(false)

  const handle_download = async (): Promise<void> => {
    set_is_downloading(true)
    set_error(null)
    set_status_message(null)

    try {
      const response = await fetch('/api/backup')

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? 'Download failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = 'db.json'
      link.click()
      URL.revokeObjectURL(url)
      set_status_message('Backup downloaded.')
    } catch (download_error: unknown) {
      set_error(
        download_error instanceof Error
          ? download_error.message
          : String(download_error),
      )
    } finally {
      set_is_downloading(false)
    }
  }

  const handle_restore_click = (): void => {
    file_input_ref.current?.click()
  }

  const handle_file_change = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (file === undefined) {
      return
    }

    const confirmed = await confirm(get_restore_db_confirm_dialog())

    if (!confirmed) {
      return
    }

    set_is_restoring(true)
    set_error(null)
    set_status_message(null)

    try {
      const text = await file.text()
      let uploaded: unknown

      try {
        uploaded = JSON.parse(text)
      } catch {
        throw new Error('Invalid backup file: file is not valid JSON.')
      }
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploaded),
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? 'Restore failed')
      }

      set_status_message('Backup restored. Opening tracker…')
      push_tracker_db_cloud_after_change()
      router.push('/')
      router.refresh()
    } catch (restore_error: unknown) {
      set_error(
        restore_error instanceof Error
          ? restore_error.message
          : String(restore_error),
      )
    } finally {
      set_is_restoring(false)
    }
  }

  const is_busy = is_downloading || is_restoring

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 text-[0.95rem] font-semibold">Backup and restore</h2>
        <p className="m-0 text-[0.8rem] leading-snug text-muted">
          Download a copy of your database or replace it with a previously saved
          backup file.
        </p>
      </div>
      <p
        className="m-0 overflow-wrap-anywhere font-mono text-[0.65rem] leading-snug text-muted"
        title={db_path}
      >
        {db_path}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={get_button_class_name('ghost', 'small')}
          disabled={is_busy}
          onClick={() => void handle_download()}
        >
          {is_downloading ? 'Downloading…' : 'Download backup'}
        </button>
        <button
          type="button"
          className={get_button_class_name('danger', 'small')}
          disabled={is_busy}
          onClick={handle_restore_click}
        >
          {is_restoring ? 'Restoring…' : 'Restore from file'}
        </button>
        <input
          ref={file_input_ref}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => void handle_file_change(event)}
        />
      </div>
      {status_message !== null ? (
        <p className="m-0 text-[0.82rem] text-accent">{status_message}</p>
      ) : null}
      {error !== null ? (
        <p className="m-0 text-[0.82rem] text-danger">{error}</p>
      ) : null}
    </div>
  )
}

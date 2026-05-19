'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { use_confirm_dialog } from '@/components/confirm-dialog-provider'
import { get_button_class_name } from '@/lib/get_button_class_name'
import { type CloudSyncStatus } from '@/lib/get_cloud_sync_status'
import { use_supabase_auth_session } from '@/lib/use_supabase_auth_session'

type SyncAction = 'push' | 'pull'

/**
 * Manual cloud sync controls and status display.
 */
export function CloudSyncActions(): React.ReactElement | null {
  const router = useRouter()
  const { confirm } = use_confirm_dialog()
  const { email, is_configured } = use_supabase_auth_session()
  const [status, set_status] = useState<CloudSyncStatus | null>(null)
  const [is_loading, set_is_loading] = useState(true)
  const [pending_action, set_pending_action] = useState<SyncAction | null>(null)
  const [message, set_message] = useState<string | null>(null)
  const [error, set_error] = useState<string | null>(null)

  const load_status = async (): Promise<void> => {
    try {
      const response = await fetch('/api/sync/status')

      if (!response.ok) {
        throw new Error('Failed to load sync status')
      }

      const next_status = (await response.json()) as CloudSyncStatus

      set_status(next_status)
    } catch (load_error: unknown) {
      set_error(
        load_error instanceof Error ? load_error.message : String(load_error),
      )
    } finally {
      set_is_loading(false)
    }
  }

  useEffect(() => {
    if (!is_configured) {
      set_is_loading(false)
      return
    }

    void load_status()
  }, [is_configured, email])

  if (!is_configured || email === null) {
    return null
  }

  const run_action = async (action: SyncAction): Promise<void> => {
    const confirmed = await confirm(
      action === 'push'
        ? {
            title: 'Push local to cloud?',
            message:
              'Merge your local db.json into the cloud database. Entries with the same id are combined; local data wins when they conflict.',
            confirmLabel: 'Push to cloud',
            variant: 'danger',
          }
        : {
            title: 'Pull cloud to local?',
            message:
              'Merge the cloud database into your local db.json. Entries with the same id are combined; cloud data wins when they conflict.',
            confirmLabel: 'Pull from cloud',
            variant: 'danger',
          },
    )

    if (!confirmed) {
      return
    }

    set_pending_action(action)
    set_message(null)
    set_error(null)

    try {
      const response = await fetch(`/api/sync/${action}`, { method: 'POST' })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }

        throw new Error(body.error ?? `${action} failed`)
      }

      set_message(
        action === 'push'
          ? 'Cloud database merged with local file.'
          : 'Local db.json merged with cloud database.',
      )

      await load_status()
      router.refresh()
    } catch (action_error: unknown) {
      set_error(
        action_error instanceof Error
          ? action_error.message
          : String(action_error),
      )
    } finally {
      set_pending_action(null)
    }
  }

  const imported_label =
    status?.local_imported_at !== null && status?.local_imported_at !== undefined
      ? new Date(status.local_imported_at).toLocaleString()
      : 'never'

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 text-[0.95rem] font-semibold">Manual sync</h2>
        <p className="m-0 text-[0.8rem] leading-snug text-muted">
          Merge local db.json with your cloud database. Conflicting entries keep
          the most recent timer; push favors local, pull favors cloud.
        </p>
      </div>
      {is_loading ? (
        <p className="m-0 text-[0.82rem] text-muted">Loading sync status…</p>
      ) : (
        <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-[0.82rem]">
          <dt className="text-muted">Cloud sheets</dt>
          <dd className="m-0 font-mono">{status?.cloud_sheet_count ?? 0}</dd>
          <dt className="text-muted">Last local import</dt>
          <dd className="m-0 font-mono">{imported_label}</dd>
        </dl>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={get_button_class_name('ghost', 'small')}
          disabled={pending_action !== null}
          onClick={() => void run_action('push')}
        >
          {pending_action === 'push' ? 'Pushing…' : 'Push local → cloud'}
        </button>
        <button
          type="button"
          className={get_button_class_name('ghost', 'small')}
          disabled={pending_action !== null}
          onClick={() => void run_action('pull')}
        >
          {pending_action === 'pull' ? 'Pulling…' : 'Pull cloud → local'}
        </button>
      </div>
      {message !== null ? (
        <p className="m-0 text-[0.82rem] text-accent">{message}</p>
      ) : null}
      {error !== null ? (
        <p className="m-0 text-[0.82rem] text-danger">{error}</p>
      ) : null}
    </div>
  )
}

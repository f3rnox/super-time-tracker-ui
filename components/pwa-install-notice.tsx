'use client'

import { useEffect, useState } from 'react'

import { get_button_class_name } from '@/lib/get_button_class_name'

const PWA_INSTALL_NOTICE_DISMISSED_KEY = 'super-time-tracker-pwa-install-notice-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Startup notification prompting the user to install the app as a PWA.
 */
export function PwaInstallNotice() {
  const [deferred_prompt, set_deferred_prompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [is_dismissed, set_is_dismissed] = useState(true)
  const [is_installing, set_is_installing] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const is_standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // Safari iOS standalone flag.
      ('standalone' in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true)
    const dismissed =
      window.localStorage.getItem(PWA_INSTALL_NOTICE_DISMISSED_KEY) === 'true'

    if (is_standalone || dismissed) {
      set_is_dismissed(true)
      return
    }

    set_is_dismissed(false)

    const on_before_install_prompt = (event: Event) => {
      event.preventDefault()
      set_deferred_prompt(event as BeforeInstallPromptEvent)
    }

    const on_app_installed = () => {
      window.localStorage.setItem(PWA_INSTALL_NOTICE_DISMISSED_KEY, 'true')
      set_is_dismissed(true)
      set_deferred_prompt(null)
    }

    window.addEventListener('beforeinstallprompt', on_before_install_prompt)
    window.addEventListener('appinstalled', on_app_installed)

    return () => {
      window.removeEventListener('beforeinstallprompt', on_before_install_prompt)
      window.removeEventListener('appinstalled', on_app_installed)
    }
  }, [])

  if (is_dismissed) {
    return null
  }

  return (
    <aside className="fixed right-4 bottom-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-accent-border bg-panel p-3.5 shadow-md">
      <p className="m-0 text-[0.9rem] font-semibold">Install app</p>
      <p className="m-0 mt-1 text-[0.82rem] leading-snug text-muted">
        {deferred_prompt !== null
          ? 'Install Super Time Tracker for offline use and a faster startup.'
          : 'Install from your browser menu to enable app-style launch and offline support.'}
      </p>
      <div className="mt-3 flex gap-2">
        {deferred_prompt !== null ? (
          <button
            type="button"
            className={get_button_class_name('primary', 'small')}
            disabled={is_installing}
            onClick={() => {
              set_is_installing(true)
              void deferred_prompt.prompt()
                .then(async () => {
                  const choice = await deferred_prompt.userChoice

                  if (choice.outcome === 'accepted') {
                    window.localStorage.setItem(PWA_INSTALL_NOTICE_DISMISSED_KEY, 'true')
                    set_is_dismissed(true)
                  }
                })
                .finally(() => {
                  set_is_installing(false)
                  set_deferred_prompt(null)
                })
            }}
          >
            {is_installing ? 'Opening…' : 'Install'}
          </button>
        ) : null}
        <button
          type="button"
          className={get_button_class_name('ghost', 'small')}
          onClick={() => {
            window.localStorage.setItem(PWA_INSTALL_NOTICE_DISMISSED_KEY, 'true')
            set_is_dismissed(true)
          }}
        >
          Dismiss
        </button>
      </div>
    </aside>
  )
}

'use client'

import { type ReactNode } from 'react'

import { AppKeyboardShortcuts } from '@/components/app-keyboard-shortcuts'
import { CommandPaletteProvider } from '@/components/command-palette-provider'
import { CloudSyncProvider } from '@/components/cloud-sync-provider'
import { ConfirmDialogProvider } from '@/components/confirm-dialog-provider'
import { NotificationRulesRunner } from '@/components/notification-rules-runner'
import { PwaInstallNotice } from '@/components/pwa-install-notice'
import { ToastNotifications } from '@/components/toast-notifications'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * Single client boundary so layout pages share confirm-dialog and sync context.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfirmDialogProvider>
      <CloudSyncProvider>
        {children}
        <AppKeyboardShortcuts />
        <CommandPaletteProvider />
        <NotificationRulesRunner />
        <ToastNotifications />
        <PwaInstallNotice />
      </CloudSyncProvider>
    </ConfirmDialogProvider>
  )
}

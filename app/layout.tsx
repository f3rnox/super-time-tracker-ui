import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AppKeyboardShortcuts } from '@/components/app-keyboard-shortcuts'
import { CloudSyncProvider } from '@/components/cloud-sync-provider'
import { ToastNotifications } from '@/components/toast-notifications'
import { ConfirmDialogProvider } from '@/components/confirm-dialog-provider'
import { DocumentPreferencesInit } from '@/components/document-preferences-init'
import { PwaRegister } from '@/components/pwa-register'
import { ThemeModeSystemListener } from '@/components/theme-mode-system-listener'
import { UiPreferencesDocumentSync } from '@/components/ui-preferences-document-sync'
import { read_document_attrs_from_cookies } from '@/lib/read_document_attrs_from_cookies'

import './globals.css'

const geist_sans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geist_mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'super-time-tracker',
  description: 'Web UI for the super-time-tracker CLI time sheets',
  manifest: '/manifest.webmanifest',
  themeColor: '#14b8a6',
  appleWebApp: {
    capable: true,
    title: 'super-time-tracker',
    statusBarStyle: 'default',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { theme, palette, compact_lists } = await read_document_attrs_from_cookies()

  return (
    <html
      lang="en"
      className={`${geist_sans.variable} ${geist_mono.variable} h-full antialiased`}
      data-theme={theme}
      data-palette={palette}
      data-compact-lists={compact_lists ? 'true' : 'false'}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans transition-[background-color,color] duration-200">
        <DocumentPreferencesInit />
        <PwaRegister />
        <ThemeModeSystemListener />
        <UiPreferencesDocumentSync />
        <ConfirmDialogProvider>
          <CloudSyncProvider>
            <AppKeyboardShortcuts />
            {children}
            <ToastNotifications />
          </CloudSyncProvider>
        </ConfirmDialogProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'

import { AppKeyboardShortcuts } from '@/components/app-keyboard-shortcuts'
import { CloudSyncProvider } from '@/components/cloud-sync-provider'
import { ToastNotifications } from '@/components/toast-notifications'
import { ConfirmDialogProvider } from '@/components/confirm-dialog-provider'
import { ThemeModeSystemListener } from '@/components/theme-mode-system-listener'
import { theme_init_script } from '@/lib/theme_init_script'
import { ui_settings_init_script } from '@/lib/ui_settings_init_script'

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geist_sans.variable} ${geist_mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans transition-[background-color,color] duration-200">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: theme_init_script }}
        />
        <Script
          id="ui-settings-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: ui_settings_init_script }}
        />
        <ThemeModeSystemListener />
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

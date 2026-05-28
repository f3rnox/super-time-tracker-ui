import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AppProviders } from '@/components/app-providers'
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
  icons: {
    icon: [
      { url: '/icons/favicon.ico', type: 'image/x-icon' },
      { url: '/icons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: 'super-time-tracker',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#14b8a6',
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}

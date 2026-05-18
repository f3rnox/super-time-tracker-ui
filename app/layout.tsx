import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { theme_init_script } from '@/lib/theme_init_script'

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: theme_init_script }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  )
}

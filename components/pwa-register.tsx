'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker for offline/PWA behavior.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    void navigator.serviceWorker.register('/sw.js')
  }, [])

  return null
}

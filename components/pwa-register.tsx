"use client";

import { useEffect } from "react";

const SHELL_CACHE_NAME = "super-time-tracker-shell-v1";

const collect_shell_asset_urls = (): string[] => {
  if (typeof document === "undefined") {
    return [];
  }

  const script_urls = Array.from(document.querySelectorAll("script[src]"))
    .map((element) => (element as HTMLScriptElement).src)
    .filter((value) => value.length > 0);
  const stylesheet_urls = Array.from(
    document.querySelectorAll(
      'link[rel="stylesheet"],link[rel="modulepreload"],link[rel="preload"][as="script"],link[rel="preload"][as="style"]',
    ),
  )
    .map((element) => (element as HTMLLinkElement).href)
    .filter((value) => value.length > 0);

  return [...new Set([...script_urls, ...stylesheet_urls])].filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  });
};

/**
 * Registers the service worker for offline/PWA behavior.
 */
export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("caches" in window)
    ) {
      return;
    }

    const warm_shell_assets = (): void => {
      const asset_urls = collect_shell_asset_urls();

      if (asset_urls.length === 0) {
        return;
      }

      void caches.open(SHELL_CACHE_NAME).then((cache) =>
        Promise.all(
          asset_urls.map((asset_url) =>
            fetch(asset_url, { cache: "no-store" })
              .then((response) => {
                if (response.ok) {
                  return cache.put(asset_url, response.clone());
                }
                return Promise.resolve();
              })
              .catch(() => Promise.resolve()),
          ),
        ),
      );
    };

    void navigator.serviceWorker.register("/sw.js").then(() => {
      warm_shell_assets();
    });
  }, []);

  return null;
}

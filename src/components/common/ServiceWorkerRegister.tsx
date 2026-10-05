'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Check for updates periodically
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('Hbibna offline cache updated.');
                    } else {
                      console.log('Hbibna offline ready.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn('Hbibna Service Worker registration note:', error);
          });
      });
    }
  }, []);

  return null;
}

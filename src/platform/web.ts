// Browser-Adapter für schnelle Entwicklung: localStorage, Sichtbarkeit, Escape als Zurück.
import type { Platform } from './types';

export function createWebPlatform(): Platform {
  const cleanups: Array<() => void> = [];
  const listen = <K extends keyof WindowEventMap>(target: Window | Document, type: K | string, fn: (e: Event) => void) => {
    target.addEventListener(type, fn);
    cleanups.push(() => target.removeEventListener(type, fn));
  };

  return {
    kind: 'web',
    storageKind: 'Browser (localStorage)',
    storage: {
      async get(k) {
        try {
          return localStorage.getItem(k);
        } catch {
          return null;
        }
      },
      async set(k, v) {
        localStorage.setItem(k, v);
      },
      async remove(k) {
        localStorage.removeItem(k);
      },
    },
    haptics: { tap() {} },
    onPause(fn) {
      listen(document, 'visibilitychange', () => {
        if (document.hidden) fn();
      });
      listen(window, 'pagehide', fn);
    },
    onResume(fn) {
      listen(document, 'visibilitychange', () => {
        if (!document.hidden) fn();
      });
    },
    onBack(fn) {
      listen(window, 'keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Escape') fn();
      });
    },
    minimize() {},
    async setup() {},
    dispose() {
      cleanups.splice(0).forEach((c) => c());
    },
  };
}

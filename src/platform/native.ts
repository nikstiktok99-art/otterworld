// Capacitor-Adapter für iPhone und Android.
// Speicher: Preferences (iOS: UserDefaults, Android: SharedPreferences) – den leert das System nicht wie den WebView-Speicher.
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import type { Platform } from './types';

export function createNativePlatform(): Platform {
  const handles: Array<Promise<PluginListenerHandle>> = [];
  const kind = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';

  return {
    kind,
    storageKind: 'nativ (Preferences)',
    storage: {
      async get(key) {
        return (await Preferences.get({ key })).value;
      },
      async set(key, value) {
        await Preferences.set({ key, value });
      },
      async remove(key) {
        await Preferences.remove({ key });
      },
    },
    haptics: {
      tap() {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      },
    },
    onPause(fn) {
      handles.push(App.addListener('pause', fn));
      handles.push(
        App.addListener('appStateChange', (s) => {
          if (!s.isActive) fn();
        }),
      );
    },
    onResume(fn) {
      handles.push(App.addListener('resume', fn));
    },
    onBack(fn) {
      handles.push(App.addListener('backButton', fn));
    },
    minimize() {
      if (kind === 'android') App.minimizeApp().catch(() => {});
    },
    async setup() {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // Statusleiste ist Kosmetik – Fehler hier dürfen den Start nicht verhindern.
      }
    },
    dispose() {
      for (const h of handles.splice(0)) h.then((x) => x.remove()).catch(() => {});
    },
  };
}

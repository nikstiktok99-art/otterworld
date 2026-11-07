import type { KeyValueStore } from '../app/saveStore';

export interface Platform {
  kind: 'ios' | 'android' | 'web';
  storageKind: string;
  storage: KeyValueStore;
  haptics: { tap(): void };
  onPause(fn: () => void): void;
  onResume(fn: () => void): void;
  /** Android-Zurück (im Browser: Escape-Taste zum Testen). */
  onBack(fn: () => void): void;
  /** App in den Hintergrund schicken (Android), statt sie zu beenden. */
  minimize(): void;
  setup(): Promise<void>;
  dispose(): void;
}

import { createContext, useContext, useSyncExternalStore } from 'react';
import type { Content } from '../content/types';
import type { GameState } from '../game/types';
import type { DialogController } from '../app/dialogs';
import type { GameSession } from '../app/session';
import type { Sound } from '../app/sound';
import type { UiState, UiStore } from '../app/ui';
import type { Platform } from '../platform';

export interface AppDeps {
  session: GameSession;
  ui: UiStore;
  dialogs: DialogController;
  sound: Sound;
  platform: Platform;
  content: Content;
  version: string;
  contentErrors: string[];
  loadNotes: string[];
  assetWarnings: () => string[];
  zoom: () => number | null;
  resetGame: () => Promise<void>;
}

export const AppContext = createContext<AppDeps | null>(null);

export function useApp(): AppDeps {
  const deps = useContext(AppContext);
  if (!deps) throw new Error('AppContext fehlt');
  return deps;
}

export function useGameState(): GameState {
  const { session } = useApp();
  return useSyncExternalStore(session.subscribe, session.getState);
}

export function useUi(): UiState {
  const { ui } = useApp();
  return useSyncExternalStore(ui.subscribe, ui.getState);
}

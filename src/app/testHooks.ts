// Zugriff für automatische Browsertests (nur im Entwicklungsmodus oder mit ?test in der Adresse).
import type { Tile } from '../game/types';
import type { WorldScene } from '../world/WorldScene';
import type { DialogController } from './dialogs';
import type { GameSession } from './session';
import type { UiStore } from './ui';

export function installTestHooks(d: { session: GameSession; ui: UiStore; dialogs: DialogController; world: () => WorldScene | null }) {
  (window as unknown as { __otterwelt: unknown }).__otterwelt = {
    state: () => d.session.getState(),
    ui: () => ({ panel: d.ui.getState().panel, decorate: d.ui.getState().decorate }),
    ready: () => d.world() !== null,
    tileToScreen: (x: number, y: number) => d.world()?.tileToScreen({ x, y } as Tile) ?? null,
    world: () => d.world()?.debugInfo() ?? null,
    flush: () => d.session.flush(),
  };
}

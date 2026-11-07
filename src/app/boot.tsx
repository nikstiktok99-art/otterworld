// Startet eine Spielinstanz und verbindet Inhalt, Spielregeln, Darstellung und Plattformdienste.
import Phaser from 'phaser';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { content } from '../content';
import { validateContent } from '../content/validate';
import { assetKeys } from '../assets/catalog';
import { newGame } from '../game/state';
import { createPlatform } from '../platform';
import { WorldScene, type WorldDeps } from '../world/WorldScene';
import { AppContext, type AppDeps } from '../ui/context';
import { UiRoot } from '../ui/UiRoot';
import { DialogController } from './dialogs';
import { SaveStore } from './saveStore';
import { GameSession } from './session';
import { Sound } from './sound';
import { UiStore } from './ui';
import { installTestHooks } from './testHooks';
import { VERSION_LABEL } from './version';

export async function boot(): Promise<() => void> {
  const platform = createPlatform();
  await platform.setup();

  const contentErrors = validateContent(content, assetKeys());
  if (contentErrors.length) console.warn('Inhaltsfehler:', contentErrors);

  const save = new SaveStore(platform.storage);
  const loaded = await save.load(content).catch((e: unknown) => ({
    state: null,
    problem: 'corrupt' as const,
    notes: [`Laden fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}`],
  }));
  const session = new GameSession(loaded.state ?? newGame(content), content, save);
  const ui = new UiStore();
  const sound = new Sound(() => session.getState().settings.sound);
  const dialogs = new DialogController(session, ui, sound);
  let assetWarnings: string[] = [];

  const world = (): WorldScene | null => {
    const scene = game.scene.getScene('world') as WorldScene | null;
    return scene && scene.sys.isActive() ? scene : null;
  };

  const deps: AppDeps = {
    session,
    ui,
    dialogs,
    sound,
    platform,
    content,
    version: VERSION_LABEL,
    contentErrors,
    loadNotes: loaded.notes,
    assetWarnings: () => assetWarnings,
    zoom: () => world()?.zoomLevel() ?? null,
    resetGame: async () => {
      await save.clear();
      session.replaceState(newGame(content));
      ui.open({ kind: 'title' });
    },
  };

  const reactRoot = createRoot(document.getElementById('ui')!);
  reactRoot.render(
    <StrictMode>
      <AppContext.Provider value={deps}>
        <UiRoot />
      </AppContext.Provider>
    </StrictMode>,
  );

  const worldDeps: WorldDeps = {
    session,
    ui,
    dialogs,
    sound,
    platform,
    content,
    onWarnings: (w) => {
      assetWarnings = [...w];
      if (w.length) console.warn('Grafik:', w);
    },
  };

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#3d86a8',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    banner: false,
    disableContextMenu: true,
    audio: { noAudio: true },
    input: { activePointers: 2 },
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  });
  game.scene.add('world', WorldScene, true, worldDeps);

  // Unterbrechen: sichere Position melden und sofort speichern (iOS gibt dafür nur Sekunden).
  platform.onPause(() => {
    world()?.reportPosition();
    void session.flush();
    sound.suspend();
  });
  platform.onResume(() => sound.resume());

  // Android-Zurück: schließt das Oberste, im Spiel selbst geht die App in den Hintergrund.
  platform.onBack(() => {
    const st = ui.getState();
    if (st.panel?.kind === 'dialog') dialogs.next();
    else if (st.panel?.kind === 'name' || st.panel?.kind === 'saveExport' || st.panel?.kind === 'saveImport' || st.panel?.kind === 'tech') ui.open({ kind: 'menu' });
    else if (st.panel && st.panel.kind !== 'title') ui.close();
    else if (st.decorate) ui.set({ decorate: null });
    else platform.minimize();
  });

  if (import.meta.env.DEV || location.search.includes('test')) installTestHooks({ session, ui, dialogs, world });

  return () => {
    platform.dispose();
    ui.dispose();
    game.destroy(true);
    reactRoot.unmount();
  };
}

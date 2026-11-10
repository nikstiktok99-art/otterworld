import { activeHint, friendList } from '../game/text';
import { Icon } from './icons';
import type { RejectReason } from '../game/actions';
import { useApp, useGameState, useUi } from './context';

export function Hud() {
  const { ui, content, sound } = useApp();
  const state = useGameState();
  const u = useUi();
  if (u.panel?.kind === 'title' || u.decorate) return null;
  const hint = activeHint(state, content);
  // Das Freundebuch erscheint, sobald sie jemanden kennt.
  const hasFriends = friendList(state, content).length > 1;
  // Die Wegkarte erscheint, sobald sie einen zweiten Ort betreten hat.
  const hasMap = state.visited.length > 1;
  const open = (kind: 'bag' | 'menu' | 'friends' | 'quests' | 'karte') => {
    sound.play('sfx.tipp');
    ui.open({ kind });
  };
  return (
    <div className="hud">
      <div className="hud-row">
        <button className="hud-btn" onClick={() => open('bag')}>
          <Icon name="bag" />
          <span>Beutel</span>
        </button>
        {hasFriends && (
          <button className="hud-btn" onClick={() => open('friends')}>
            <Icon name="friends" />
            <span>Freunde</span>
          </button>
        )}
        {hasMap && (
          <button className="hud-btn" onClick={() => open('karte')}>
            <Icon name="map" />
            <span>Karte</span>
          </button>
        )}
        <button className="hud-btn" onClick={() => open('menu')}>
          <Icon name="settings" />
          <span>Menü</span>
        </button>
      </div>
      {hint && (
        // Antippen öffnet das Aufgabenbuch.
        <button className="hint" aria-label={`${hint} – Aufgabenbuch öffnen`} onClick={() => open('quests')}>
          <Icon name="task" className="hint-icon" />
          <span>{hint}</span>
        </button>
      )}
    </div>
  );
}

export function Toasts() {
  const u = useUi();
  if (u.toasts.length === 0) return null;
  return (
    <div className="toasts" aria-live="polite">
      {u.toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.text}
        </div>
      ))}
    </div>
  );
}

const PROBLEM_TEXT: Partial<Record<RejectReason, string>> = {
  outsideZone: 'Hier ist kein Platz für Deko.',
  notPlaceable: 'Auf Wasser, dem Steg oder dem Pfad geht das nicht.',
  occupied: 'Da ist schon etwas.',
};

export function DecorateBar() {
  const { ui, session, content, sound } = useApp();
  const u = useUi();
  const d = u.decorate;
  if (!d) return null;
  const item = content.items[d.item];
  let text = 'Tippe auf einen hellen Platz.';
  if (d.tile && d.problem) {
    text =
      d.problem.reason === 'blocksPath'
        ? `Hier würde sie ${d.problem.detail ?? 'den Weg'} versperren.`
        : (PROBLEM_TEXT[d.problem.reason] ?? 'Hier geht es leider nicht.');
  } else if (d.tile) {
    text = `${item?.name ?? 'Deko'} hier aufstellen?`;
  }
  const confirm = () => {
    if (!d.tile) return;
    const events =
      d.mode === 'move' && d.uid
        ? session.dispatch({ type: 'moveDeco', uid: d.uid, tile: d.tile })
        : session.dispatch({ type: 'placeDeco', item: d.item, map: session.getState().location.map, tile: d.tile });
    const rej = events.find((e) => e.type === 'rejected');
    if (rej && rej.type === 'rejected') {
      sound.play('sfx.nein');
      ui.set({ decorate: { ...d, problem: { reason: rej.reason, ...(rej.detail ? { detail: rej.detail } : {}) } } });
      return;
    }
    ui.set({ decorate: null });
  };
  return (
    <div className="decorate-bar" role="toolbar">
      <p className={d.problem ? 'deco-text problem' : 'deco-text'}>{text}</p>
      <div className="row">
        <button className="btn" onClick={() => ui.set({ decorate: null })}>
          <Icon name="close" className="btn-icon" />
          <span>Abbrechen</span>
        </button>
        <button className="btn primary" disabled={!d.tile || !!d.problem} onClick={confirm}>
          <Icon name="place" className="btn-icon" />
          <span>
            {d.mode === 'move' ? 'Hierhin versetzen' : 'Hier aufstellen'}
          </span>
        </button>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { count } from '../game/state';
import { exportCode, importCode } from '../game/save/codec';
import { normalizeState } from '../game/save/normalize';
import { characterName, fillText, friendList } from '../game/text';
import { useApp, useGameState, useUi } from './context';
import { NameForm } from './Dialog';
import { portraitSrc } from './portraits';

function Sheet({ title, children, onClose, closeLabel = 'Zurück' }: { title: string; children: ReactNode; onClose: () => void; closeLabel?: string }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet panel" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="panel-body">{children}</div>
        <button className="btn ghost" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
}

export function TitlePanel() {
  const { ui, sound, session } = useApp();
  const s = useGameState();
  const resume = s.player.name !== null || Object.keys(s.quests).length > 0 || s.gathered.length > 0;
  return (
    <div className="backdrop title-screen">
      <div className="title-card">
        <h1>Otterwelt</h1>
        <button
          className="btn primary big"
          onClick={() => {
            sound.unlock();
            sound.play('sfx.tipp');
            ui.close();
            if (session.save.readOnly) {
              ui.open({
                kind: 'notice',
                title: 'Hinweis',
                text: 'Dieser Spielstand stammt aus einer neueren Version des Spiels. Bitte die neueste Version installieren – bis dahin wird nichts gespeichert.',
              });
            }
          }}
        >
          {resume ? 'Weiterspielen' : 'Spielen'}
        </button>
      </div>
    </div>
  );
}

export function BagPanel() {
  const { ui, content } = useApp();
  const s = useGameState();
  const items = Object.entries(s.inventory).filter(([, n]) => n > 0);
  const placed = s.deco;
  const here = content.maps[s.location.map];
  // Aufstellen und Versetzen nur dort, wo Deko stehen darf.
  const canDecorate = !!here?.decorZone;
  const decoHome = Object.values(content.maps).find((m) => m.decorZone);
  return (
    <Sheet title="Beutel" onClose={() => ui.close()}>
      {items.length === 0 && placed.length === 0 && <p className="muted">Noch nichts dabei.</p>}
      <ul className="list">
        {items.map(([id, n]) => {
          const item = content.items[id];
          return (
            <li key={id} className="list-row">
              <span>
                {item ? (n === 1 ? item.name : item.plural) : id} <strong>{n}</strong>
              </span>
              {item?.kind === 'deco' &&
                (canDecorate ? (
                  <button className="btn small primary" onClick={() => ui.set({ panel: null, decorate: { mode: 'place', item: id, tile: null, problem: null } })}>
                    Aufstellen
                  </button>
                ) : (
                  <span className="muted small">aufstellen {decoHome?.at ?? 'am Ufer'}</span>
                ))}
            </li>
          );
        })}
        {placed.map((d) => (
          <li key={d.uid} className="list-row">
            <span>
              {content.items[d.item]?.name ?? d.item} <span className="muted">steht {content.maps[d.map]?.at ?? 'am Ufer'}</span>
            </span>
            {d.map === s.location.map && canDecorate && (
              <button
                className="btn small"
                onClick={() => ui.set({ panel: null, decorate: { mode: 'move', item: d.item, uid: d.uid, tile: null, problem: null } })}
              >
                Versetzen
              </button>
            )}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export function FriendsPanel() {
  const { ui, content, session, sound } = useApp();
  const s = useGameState();
  const friends = friendList(s, content);
  return (
    <Sheet title="Freundebuch" onClose={() => ui.close()}>
      <ul className="list friends">
        {friends.map((id) => {
          const ch = content.characters[id];
          if (!ch) return null;
          const isStart = id === content.start.character;
          const active = s.activeCharacter === id;
          const playable = s.unlocked.includes(id);
          const moments = Object.values(content.moments).filter((m) => m.character === id && s.moments.includes(m.id));
          const portrait = portraitSrc(ch.portrait);
          const name = characterName(id, s, content);
          return (
            <li key={id} className={active ? 'friend active' : 'friend'}>
              <div className="friend-head">
                {portrait && <img className="portrait" src={portrait} alt="" />}
                <div>
                  <p className="friend-name">{name}</p>
                  <p className="muted">{isStart ? 'Dein Otter' : ch.friend?.about}</p>
                </div>
              </div>
              {moments.length > 0 && (
                <ul className="moments">
                  {moments.map((m) => (
                    <li key={m.id}>
                      <strong>{m.title}</strong> – {fillText(m.text, s)}
                    </li>
                  ))}
                </ul>
              )}
              {active ? (
                <p className="friend-status">Du spielst gerade {isStart ? 'als dein Otter' : `als ${name}`}.</p>
              ) : playable ? (
                <button
                  className="btn primary"
                  onClick={() => {
                    sound.play('sfx.tipp');
                    ui.close();
                    session.dispatch({ type: 'switchCharacter', character: id });
                  }}
                >
                  {isStart ? 'Wieder als Otter spielen' : `Als ${name} spielen`}
                </button>
              ) : (
                <p className="muted small">Ihr lernt euch noch kennen.</p>
              )}
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

export function WorkbenchPanel() {
  const { ui, content, session } = useApp();
  const s = useGameState();
  const [built, setBuilt] = useState<string | null>(null);
  const known = s.recipesKnown.map((id) => content.recipes[id]).filter((r) => !!r);
  if (built) {
    const item = content.items[built];
    return (
      <Sheet title="Werkbank" onClose={() => ui.close()} closeLabel="Später">
        <p className="big-text">{item?.name ?? built} gebaut.</p>
        {item?.kind === 'deco' && count(s, built) > 0 && (
          <button className="btn primary" onClick={() => ui.set({ panel: null, decorate: { mode: 'place', item: built, tile: null, problem: null } })}>
            Jetzt aufstellen
          </button>
        )}
      </Sheet>
    );
  }
  return (
    <Sheet title="Werkbank" onClose={() => ui.close()}>
      {known.length === 0 && <p className="muted">Hier kannst du bauen, sobald du weißt wie.</p>}
      {known.map((r) => {
        const ok = Object.entries(r.inputs).every(([i, n]) => count(s, i) >= n);
        return (
          <div key={r.id} className="recipe">
            <p className="recipe-name">{r.name}</p>
            <ul className="list compact">
              {Object.entries(r.inputs).map(([i, n]) => {
                const have = count(s, i);
                const item = content.items[i];
                return (
                  <li key={i} className={have >= n ? 'list-row done' : 'list-row'}>
                    <span>{item ? (n === 1 ? item.name : item.plural) : i}</span>
                    <span>
                      {Math.min(have, n)} von {n}
                    </span>
                  </li>
                );
              })}
            </ul>
            <button
              className="btn primary"
              disabled={!ok}
              onClick={() => {
                const ev = session.dispatch({ type: 'craft', recipe: r.id });
                if (ev.some((e) => e.type === 'crafted')) setBuilt(r.output.item);
              }}
            >
              Bauen
            </button>
          </div>
        );
      })}
    </Sheet>
  );
}

export function MenuPanel() {
  const { ui, session, sound } = useApp();
  const s = useGameState();
  const toggle = (key: 'sound' | 'haptics') => {
    session.dispatch({ type: 'setSetting', key, value: !s.settings[key] });
    sound.play('sfx.tipp');
  };
  return (
    <Sheet title="Menü" onClose={() => ui.close()} closeLabel="Zurück zum Spiel">
      <div className="stack">
        <button className="btn" onClick={() => toggle('sound')}>
          Ton: {s.settings.sound ? 'an' : 'aus'}
        </button>
        <button className="btn" onClick={() => toggle('haptics')}>
          Vibration: {s.settings.haptics ? 'an' : 'aus'}
        </button>
        {s.player.name && (
          <button className="btn" onClick={() => ui.open({ kind: 'name' })}>
            Name ändern
          </button>
        )}
        <button className="btn" onClick={() => ui.open({ kind: 'saveExport' })}>
          Spielstand sichern
        </button>
        <button className="btn" onClick={() => ui.open({ kind: 'saveImport' })}>
          Spielstand laden
        </button>
        <button className="btn ghost" onClick={() => ui.open({ kind: 'tech' })}>
          Technik-Info
        </button>
      </div>
    </Sheet>
  );
}

export function NamePanel() {
  const { ui, session } = useApp();
  const s = useGameState();
  return (
    <div className="backdrop top" onClick={() => ui.open({ kind: 'menu' })}>
      <div className="sheet name-sheet" role="dialog" aria-label="Name ändern" onClick={(e) => e.stopPropagation()}>
        <h2>Name ändern</h2>
        <NameForm
          initial={s.player.name ?? ''}
          onSubmit={(name) => {
            const ev = session.dispatch({ type: 'setPlayerName', name });
            if (ev.some((e) => e.type === 'rejected')) return 'Bitte 1–16 Buchstaben oder Ziffern (auch Leerzeichen und Bindestrich).';
            ui.open({ kind: 'menu' });
            return null;
          }}
        />
        <button className="btn ghost" onClick={() => ui.open({ kind: 'menu' })}>
          Zurück
        </button>
      </div>
    </div>
  );
}

export function SaveExportPanel() {
  const { ui } = useApp();
  const s = useGameState();
  const code = useMemo(() => exportCode(s), [s]);
  const [copied, setCopied] = useState(false);
  return (
    <Sheet title="Spielstand sichern" onClose={() => ui.open({ kind: 'menu' })}>
      <p className="muted">Diesen Code kopieren und zum Beispiel in der Notizen-App aufheben. Damit lässt sich dein Spielstand jederzeit wiederherstellen.</p>
      <textarea className="code" readOnly value={code} rows={5} onFocus={(e) => e.currentTarget.select()} />
      <button
        className="btn primary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? 'Kopiert' : 'Kopieren'}
      </button>
    </Sheet>
  );
}

export function SaveImportPanel() {
  const { ui, session, content } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <Sheet title="Spielstand laden" onClose={() => ui.open({ kind: 'menu' })}>
      <p className="muted">Gesicherten Code hier einfügen. Der aktuelle Spielstand wird dabei ersetzt.</p>
      <textarea className="code" value={code} rows={5} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
      {error && <p className="error">{error}</p>}
      <button
        className="btn primary"
        disabled={code.trim().length === 0}
        onClick={() => {
          try {
            const raw = importCode(code);
            const { state } = normalizeState(raw.state, raw.schema, content);
            session.replaceState(state);
            ui.close();
            ui.toast('Spielstand geladen.');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Der Code ließ sich nicht lesen.');
          }
        }}
      >
        Laden
      </button>
    </Sheet>
  );
}

function useSafeArea() {
  const [insets, setInsets] = useState('');
  useEffect(() => {
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    setInsets(`oben ${cs.paddingTop} · unten ${cs.paddingBottom} · links ${cs.paddingLeft} · rechts ${cs.paddingRight}`);
    probe.remove();
  }, []);
  return insets;
}

export function TechPanel() {
  const deps = useApp();
  const { ui, session, platform, version, contentErrors, loadNotes, sound } = deps;
  const s = useGameState();
  const insets = useSafeArea();
  const [confirm, setConfirm] = useState(false);
  const saved = session.save.lastSavedAt ? new Date(session.save.lastSavedAt).toLocaleTimeString('de-DE') : 'in dieser Sitzung noch nicht';
  const warnings = deps.assetWarnings();
  const rows: Array<[string, string]> = [
    ['Version', version],
    ['Plattform', platform.kind],
    ['Speicher', platform.storageKind],
    ['Zuletzt gespeichert', `${saved} (Nr. ${session.save.currentSeq})`],
    ['Speicherfehler', session.save.lastError ?? 'keine'],
    ['Safe Area', insets],
    ['Bildschirm', `${window.innerWidth} × ${window.innerHeight} @${window.devicePixelRatio}x`],
    ['Zoom', String(deps.zoom() ?? '–')],
    ['Ton', sound.state],
    ['Inhalt', contentErrors.length ? `${contentErrors.length} Fehler` : 'geprüft, ok'],
    ['Grafik', warnings.length ? `${warnings.length} Hinweise` : 'ok'],
    ['Ort', `${s.location.map} (${s.location.tile.x}, ${s.location.tile.y})`],
    ['Figur', `${s.activeCharacter} · spielbar: ${s.unlocked.join(', ')}`],
    ['Quest', JSON.stringify(s.quests)],
  ];
  return (
    <Sheet title="Technik-Info" onClose={() => ui.open({ kind: 'menu' })}>
      <dl className="tech">
        {rows.map(([k, v]) => (
          <div key={k} className="tech-row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {[...contentErrors, ...warnings, ...loadNotes].map((m) => (
        <p key={m} className="error small">
          {m}
        </p>
      ))}
      {!confirm ? (
        <button className="btn ghost" onClick={() => setConfirm(true)}>
          Neu beginnen …
        </button>
      ) : (
        <button className="btn danger" onClick={() => deps.resetGame()}>
          Wirklich alles löschen und neu beginnen
        </button>
      )}
    </Sheet>
  );
}

export function EndCard() {
  const { ui, session, content } = useApp();
  const u = useUi();
  const s = session.getState();
  if (u.panel?.kind !== 'endcard') return null;
  const quest = content.quests[u.panel.quest];
  const title = quest?.ending?.title ?? quest?.name ?? 'Geschafft';
  return (
    <div className="backdrop">
      <div className="title-card end" role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {quest?.ending && <p>{fillText(quest.ending.text, s)}</p>}
        {u.panel.unlocked.map((id) => (
          <p key={id} className="unlock">
            Im Freundebuch kannst du jetzt auch als {characterName(id, s, content)} spielen.
          </p>
        ))}
        <button className="btn primary big" onClick={() => ui.close()}>
          Weiterspielen
        </button>
      </div>
    </div>
  );
}

export function NoticePanel() {
  const { ui } = useApp();
  const u = useUi();
  if (u.panel?.kind !== 'notice') return null;
  return (
    <Sheet title={u.panel.title} onClose={() => ui.close()} closeLabel="Verstanden">
      <p>{u.panel.text}</p>
    </Sheet>
  );
}

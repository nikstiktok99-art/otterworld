// Die Wegkarte: besuchte Orte und ihre Wege, Reisen per Antippen. Platzhalter-Gestaltung – Codex kann später eine
// gemalte Karte als Hintergrund liefern (Positionen der Orte stehen in den Map-Daten unter `overview`).
import { useState } from 'react';
import { wegkarte } from '../game/text';
import { useApp, useGameState } from './context';
import { Icon } from './icons';

export function WegkartePanel() {
  const { ui, content, session, sound } = useApp();
  const s = useGameState();
  const { orte, wege } = wegkarte(s, content);
  const [wahl, setWahl] = useState<string | null>(null);
  const pos = new Map(orte.map((o) => [o.id, o]));
  const ziel = wahl ? pos.get(wahl) : undefined;

  const reisen = () => {
    if (!ziel || ziel.hier) return;
    sound.play('sfx.tipp');
    ui.close();
    session.dispatch({ type: 'fastTravel', map: ziel.id });
  };

  return (
    <div className="backdrop" onClick={() => ui.close()}>
      <div className="sheet panel wegkarte-sheet" role="dialog" aria-label="Wegkarte" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <span className="ribbon" aria-hidden="true" />
          <Icon name="map" className="head-icon" />
          <h2>Wegkarte</h2>
        </div>
        <div className="wegkarte">
          <svg className="wege" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {wege.map(([a, b]) => {
              const pa = pos.get(a)!;
              const pb = pos.get(b)!;
              return <line key={`${a}|${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />;
            })}
          </svg>
          {orte.map((o) => {
            const cls = ['ort', o.hier ? 'hier' : '', wahl === o.id ? 'gewaehlt' : ''].filter(Boolean).join(' ');
            return (
              <button
                key={o.id}
                className={cls}
                style={{ left: `${o.x}%`, top: `${o.y}%` }}
                disabled={!o.besucht}
                aria-pressed={wahl === o.id}
                onClick={() => {
                  sound.play('sfx.tipp');
                  setWahl(o.id);
                }}
              >
                <span className="ort-name">{o.besucht ? o.name : 'Unbekannter Ort'}</span>
                {o.hier && <span className="ort-hier">Du bist hier</span>}
                {o.neuigkeit && <span className="ort-punkt" title="Hier hat jemand etwas für dich" />}
              </button>
            );
          })}
        </div>
        <p className="muted small">Tippe auf einen Ort, an dem du schon warst. Ein Punkt heißt: Dort hat jemand etwas für dich.</p>
        <button className="btn primary" disabled={!ziel || ziel.hier} onClick={reisen}>
          {!ziel ? 'Ort wählen' : ziel.hier ? 'Hier bist du gerade' : `Hinreisen: ${ziel.name}`}
        </button>
        <button className="btn back" onClick={() => ui.close()}>
          <Icon name="back" className="btn-icon" />
          <span>Zurück</span>
        </button>
      </div>
    </div>
  );
}

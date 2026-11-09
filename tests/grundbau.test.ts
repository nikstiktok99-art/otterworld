// Grundbausteine für Missionen und Crafting: Aufgabenbuch, Hinweise über Figuren, Antworten, Abgeben und Geschenke,
// nachwachsende Fundstellen, Einpacken, Stationen und die Migration von 0.3.0.
import { describe, expect, it } from 'vitest';
import { afterGreeting, allGathered, content, fresh, MAP, play, rejected, T0 } from './helpers';
import type { Action, GameEvent } from '../src/game/actions';
import type { Content } from '../src/content/types';
import type { GameState } from '../src/game/types';
import { reduce } from '../src/game/reduce';
import { resolveNpcs } from '../src/game/occupancy';
import { activeHint, hasNews, questLog } from '../src/game/text';
import { normalizeState } from '../src/game/save/normalize';
import { validateContent } from '../src/content/validate';
import { assetKeys } from '../src/assets/catalog';
import { newGame, SCHEMA } from '../src/game/state';
import { DialogController } from '../src/app/dialogs';
import { GameSession } from '../src/app/session';
import { SaveStore, type KeyValueStore } from '../src/app/saveStore';
import { Sound } from '../src/app/sound';
import { UiStore } from '../src/app/ui';

const MIN = 60_000;
const BAY = 'map.schilfbucht';
const LAMP = { x: 8, y: 17 };

const eveningDone = (): GameState =>
  play(
    allGathered(afterGreeting()),
    { type: 'craft', recipe: 'recipe.uferleuchte' },
    { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: LAMP },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' },
  ).state;

/** Phase 2 abgeschlossen (Spielstand direkt zusammengesetzt, die Abläufe selbst prüft phase2.test.ts). */
function phase2Done(): GameState {
  let s = play(eveningDone(), { type: 'finishDialogue', dialogue: 'dlg.schnabbi.ausflug' }).state;
  s = play(
    s,
    { type: 'arrive', map: MAP, tile: { x: 14, y: 21 }, facing: 'se' },
    { type: 'travel', exit: 'exit.zur-bucht' },
    { type: 'gather', map: BAY, spot: 'spot.schilf.links', at: T0 },
    { type: 'gather', map: BAY, spot: 'spot.schilf.rechts', at: T0 },
    { type: 'gather', map: BAY, spot: 'spot.schilf.wasser', at: T0 },
    { type: 'arrive', map: BAY, tile: { x: 1, y: 24 }, facing: 'sw' },
    { type: 'travel', exit: 'exit.zum-ufer' },
    { type: 'craft', recipe: 'recipe.schilfmatte' },
    { type: 'placeDeco', item: 'item.schilfmatte', map: MAP, tile: { x: 5, y: 21 } },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.vertrauen' },
  ).state;
  return s;
}

function playWith(c: Content, state: GameState, ...actions: Action[]) {
  let s = state;
  const events: GameEvent[] = [];
  for (const a of actions) {
    const r = reduce(s, a, c);
    s = r.state;
    events.push(...r.events);
  }
  return { state: s, events };
}

class MemoryStore implements KeyValueStore {
  data = new Map<string, string>();
  async get(k: string) {
    return this.data.get(k) ?? null;
  }
  async set(k: string, v: string) {
    this.data.set(k, v);
  }
  async remove(k: string) {
    this.data.delete(k);
  }
}

describe('Aufgabenbuch und Hinweis oben', () => {
  it('zeigt schon vor dem ersten Gespräch, wo Schnabbi wartet', () => {
    expect(activeHint(fresh(), content)).toBe('Schnabbi wartet am Ende des Stegs');
  });

  it('eine angenommene Aufgabe steht im Buch, mit Auftraggeber und aktuellem Schritt', () => {
    const log = questLog(afterGreeting(), content);
    expect(log.active).toEqual([
      expect.objectContaining({ id: 'quest.schnabbi.licht', giver: 'schnabbi', tracked: true, step: 0, steps: 4 }),
    ]);
    expect(log.done).toEqual([]);
  });

  it('nach dem ersten Abend: erledigt, und die nächste Idee steht unter „bald“', () => {
    const log = questLog(eveningDone(), content);
    expect(log.done.map((q) => q.id)).toEqual(['quest.schnabbi.licht']);
    expect(log.offers.map((q) => q.id)).toEqual(['quest.schnabbi.schilf']);
    expect(log.active).toEqual([]);
  });

  it('mehrere offene Aufgaben: die verfolgte steht oben, erledigt wird sie wieder freigegeben', () => {
    const s = afterGreeting();
    s.quests['quest.schnabbi.schilf'] = { step: 'schilf', done: false };
    expect(activeHint(s, content)).toContain('Treibholz');
    const tracked = play(s, { type: 'trackQuest', quest: 'quest.schnabbi.schilf' }).state;
    expect(activeHint(tracked, content)).toBe('Schilfhalme 0/3');
    expect(questLog(tracked, content).active.find((q) => q.tracked)?.id).toBe('quest.schnabbi.schilf');
    expect(rejected(play(tracked, { type: 'trackQuest', quest: 'quest.gibtsnicht' }).events)).toHaveLength(1);
  });

  it('eine erledigte Aufgabe wird nicht mehr verfolgt', () => {
    const s = eveningDone();
    expect(s.tracked).toBeNull();
    expect(rejected(play(s, { type: 'trackQuest', quest: 'quest.schnabbi.licht' }).events)).toHaveLength(1);
  });
});

describe('Sprechblase über Figuren mit etwas Neuem', () => {
  it('folgt dem Spielverlauf', () => {
    expect(hasNews('schnabbi', fresh(), content)).toBe(true); // Begrüßung
    expect(hasNews('schnabbi', afterGreeting(), content)).toBe(false); // nur Tipps zum Sammeln
    const placed = play(
      allGathered(afterGreeting()),
      { type: 'craft', recipe: 'recipe.uferleuchte' },
      { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: LAMP },
    ).state;
    expect(hasNews('schnabbi', placed, content)).toBe(true); // Gespräch schließt den Schritt ab
    expect(hasNews('schnabbi', eveningDone(), content)).toBe(true); // neue Idee
    const done = phase2Done();
    expect(hasNews('schnabbi', done, content)).toBe(true); // zeigt neue Rezepte
    const after = play(done, { type: 'finishDialogue', dialogue: 'dlg.schnabbi.ideen' }).state;
    expect(hasNews('schnabbi', after, content)).toBe(false);
    expect(after.recipesKnown).toEqual(expect.arrayContaining(['recipe.treibholzbank', 'recipe.muschelwindspiel']));
  });
});

describe('Antworten im Gespräch', () => {
  const setup = (state: GameState) => {
    const ui = new UiStore();
    const session = new GameSession(state, content, new SaveStore(new MemoryStore()));
    const dialogs = new DialogController(session, ui, new Sound(() => false));
    return { ui, session, dialogs };
  };
  const toChoice = (dialogs: DialogController) => {
    for (let i = 0; i < 10; i++) {
      const line = dialogs.currentLine();
      if (line && 'choices' in line && line.choices) return;
      dialogs.next();
    }
  };

  it('„Lieber später“ beendet das Gespräch ohne Folgen – beim nächsten Mal kommt es wieder', () => {
    const { ui, session, dialogs } = setup(eveningDone());
    dialogs.start('schnabbi');
    toChoice(dialogs);
    dialogs.next(); // Antippen allein reicht bei einer Frage nicht
    expect(ui.getState().panel?.kind).toBe('dialog');
    dialogs.choose(1);
    expect(ui.getState().panel).toBeNull();
    expect(session.getState().quests['quest.schnabbi.schilf']).toBeUndefined();
    dialogs.start('schnabbi');
    expect(ui.getState().panel).toMatchObject({ kind: 'dialog', dialogue: 'dlg.schnabbi.ausflug' });
  });

  it('„Gern“ führt weiter und startet die Aufgabe', () => {
    const { session, dialogs } = setup(eveningDone());
    dialogs.start('schnabbi');
    toChoice(dialogs);
    dialogs.choose(0);
    dialogs.next();
    expect(session.getState().quests['quest.schnabbi.schilf']?.step).toBe('hinueber');
  });

  it('Android-Zurück wählt bei einer Frage „später“', () => {
    const { ui, session, dialogs } = setup(eveningDone());
    dialogs.start('schnabbi');
    toChoice(dialogs);
    dialogs.back();
    expect(ui.getState().panel).toBeNull();
    expect(session.getState().quests['quest.schnabbi.schilf']).toBeUndefined();
  });
});

describe('Abgeben und Geschenke (Datenbeispiel für spätere Missionen)', () => {
  // „Bringst du mir drei Muscheln?“ – als Testinhalt, damit der Baustein geprüft ist, bevor echte Missionen kommen.
  const withRequest = (): Content => {
    const c: Content = JSON.parse(JSON.stringify(content));
    c.dialogues.unshift({
      id: 'dlg.test.bitte',
      character: 'schnabbi',
      when: { hasItems: { 'item.muschelschale': 3 } },
      lines: [{ speaker: 'schnabbi', text: 'Oh, drei Muscheln! Für mich?' }],
      effects: [{ takeItems: { 'item.muschelschale': 3 } }, { giveItems: { 'item.schilfmatte': 1 } }],
    });
    return c;
  };

  it('nimmt genau die Gegenstände und schenkt genau einmal etwas', () => {
    const c = withRequest();
    const s = newGame(c);
    s.inventory = { 'item.muschelschale': 4 };
    const r = playWith(c, s, { type: 'finishDialogue', dialogue: 'dlg.test.bitte' }, { type: 'finishDialogue', dialogue: 'dlg.test.bitte' });
    expect(r.state.inventory).toEqual({ 'item.muschelschale': 1, 'item.schilfmatte': 1 });
    expect(r.events.filter((e) => e.type === 'itemsUsed')).toHaveLength(1);
  });

  it('fehlt etwas, passiert gar nichts – auch keine halbe Abgabe', () => {
    const c = withRequest();
    const s = newGame(c);
    s.inventory = { 'item.muschelschale': 2 };
    const r = playWith(c, s, { type: 'finishDialogue', dialogue: 'dlg.test.bitte' });
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'missingItems' });
    expect(r.state).toBe(s);
  });

  it('die Prüfung verlangt zum Abgeben eine passende Bedingung', () => {
    const c = withRequest();
    c.dialogues[0]!.when = { hasItems: { 'item.muschelschale': 2 } };
    expect(validateContent(c, assetKeys())).toEqual([expect.stringContaining('Abgeben braucht passende hasItems-Bedingung')]);
  });
});

describe('Nachwachsende Fundstellen', () => {
  const at = (t: number): Action => ({ type: 'gather', map: MAP, spot: 'spot.treibholz.strand', at: t });

  it('Treibholz wächst nach zehn Minuten nach – vorher gibt es nichts doppelt', () => {
    const r = play(fresh(), at(T0), at(T0 + 1 * MIN), at(T0 + 9 * MIN), at(T0 + 10 * MIN));
    expect(r.state.inventory['item.treibholz']).toBe(2);
    expect(rejected(r.events)).toHaveLength(2);
  });

  it('wird die Geräteuhr zurückgestellt, bleibt nichts für immer weg', () => {
    const s = play(fresh(), at(T0)).state;
    const r = play(s, at(T0 - 60 * MIN));
    expect(r.state.inventory['item.treibholz']).toBe(2);
  });

  it('Schilf gibt es weiterhin erst, wenn Schnabbi davon erzählt hat', () => {
    const s = play(eveningDone(), { type: 'arrive', map: MAP, tile: { x: 14, y: 21 }, facing: 'se' }, { type: 'travel', exit: 'exit.zur-bucht' }).state;
    const r = play(s, { type: 'gather', map: BAY, spot: 'spot.schilf.links', at: T0 });
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'notYet' });
  });

  it('mit nachwachsendem Holz lässt sich frei bauen', () => {
    let s = play(phase2Done(), { type: 'finishDialogue', dialogue: 'dlg.schnabbi.ideen' }).state;
    s = play(s, at(T0 + 20 * MIN), at(T0 + 31 * MIN), at(T0 + 42 * MIN)).state;
    const r = play(s, { type: 'craft', recipe: 'recipe.treibholzbank' });
    expect(r.state.inventory['item.treibholzbank']).toBe(1);
    expect(r.state.inventory['item.treibholz']).toBeUndefined();
  });
});

describe('Deko wieder einpacken', () => {
  it('kommt zurück in den Beutel; Schnabbi sucht sich seinen nächsten Platz', () => {
    const s = eveningDone();
    const r = play(s, { type: 'pickUpDeco', uid: 'deco-1' });
    expect(r.state.deco).toEqual([]);
    expect(r.state.inventory['item.uferleuchte']).toBe(1);
    expect(resolveNpcs(r.state, content, MAP)[0]?.tile).toEqual({ x: 10, y: 8 });
    const again = play(r.state, { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: { x: 5, y: 20 } }).state;
    expect(again.deco).toEqual([{ uid: 'deco-2', item: 'item.uferleuchte', map: MAP, tile: { x: 5, y: 20 }, on: false }]);
    expect(resolveNpcs(again, content, MAP)[0]?.tile).toEqual({ x: 6, y: 20 });
  });

  it('zweimal einpacken gibt nur eine Leuchte', () => {
    const r = play(eveningDone(), { type: 'pickUpDeco', uid: 'deco-1' }, { type: 'pickUpDeco', uid: 'deco-1' });
    expect(r.state.inventory['item.uferleuchte']).toBe(1);
    expect(rejected(r.events)).toHaveLength(1);
  });
});

describe('Stationen', () => {
  it('ein Rezept lässt sich nur an seiner Station bauen', () => {
    const s = allGathered(afterGreeting());
    const r = play(s, { type: 'craft', recipe: 'recipe.uferleuchte', station: 'kochtopf' });
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'wrongStation' });
  });

  it('die Prüfung meldet Rezepte für eine Station, die es nirgends gibt', () => {
    const c: Content = JSON.parse(JSON.stringify(content));
    c.recipes['recipe.uferleuchte']!.station = 'backofen';
    expect(validateContent(c, assetKeys())).toEqual([expect.stringContaining('backofen')]);
  });
});

describe('Migration von 0.3.0 (Schema 2)', () => {
  it('früher einmalige Fundstellen sind wieder da, alles andere bleibt', () => {
    const old = JSON.parse(JSON.stringify(eveningDone())) as Record<string, unknown>;
    delete old.regrow;
    delete old.tracked;
    old.schema = 2;
    old.gathered = ['map.startufer/spot.treibholz.strand', 'map.startufer/spot.treibholz.wasser', 'map.startufer/spot.muschel.sand'];
    const { state } = normalizeState(old, 2, content);
    expect(state.schema).toBe(SCHEMA);
    expect(state.gathered).toEqual([]);
    expect(state.regrow).toEqual({});
    expect(state.tracked).toBeNull();
    expect(state.quests['quest.schnabbi.licht']?.done).toBe(true);
    expect(state.deco).toHaveLength(1);
  });
});

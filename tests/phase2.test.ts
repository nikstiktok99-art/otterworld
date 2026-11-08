// Phase 2: Ortswechsel, zweites gemeinsames Erlebnis, Figurenwechsel, Migration und das Erbsentrio als Datenbeispiel.
import { describe, expect, it } from 'vitest';
import { afterGreeting, allGathered, content, fresh, MAP, play, rejected, T0 } from './helpers';
import type { Action, GameEvent } from '../src/game/actions';
import type { Content } from '../src/content/types';
import type { GameState } from '../src/game/types';
import { reduce } from '../src/game/reduce';
import { resolveAllNpcs, resolveNpcs } from '../src/game/occupancy';
import { checkPlacement } from '../src/game/rules/placement';
import { activeHint, friendList, selectDialogue } from '../src/game/text';
import { gridFor, standable, terrainAt } from '../src/game/space';
import { checksum, exportCode, importCode } from '../src/game/save/codec';
import { normalizeState } from '../src/game/save/normalize';
import { SaveStore, type KeyValueStore } from '../src/app/saveStore';
import { validateContent } from '../src/content/validate';
import { assetKeys } from '../src/assets/catalog';
import { newGame } from '../src/game/state';

const BAY = 'map.schilfbucht';
const Q2 = 'quest.schnabbi.schilf';
const LAMP = { x: 8, y: 17 };
const MAT = { x: 5, y: 21 };

function eveningDone(): GameState {
  return play(
    allGathered(afterGreeting()),
    { type: 'craft', recipe: 'recipe.uferleuchte' },
    { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: LAMP },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' },
  ).state;
}
const toBay = (s: GameState) =>
  play(s, { type: 'arrive', map: MAP, tile: { x: 14, y: 21 }, facing: 'se' }, { type: 'travel', exit: 'exit.zur-bucht' });
const toShore = (s: GameState) =>
  play(s, { type: 'arrive', map: BAY, tile: { x: 1, y: 24 }, facing: 'sw' }, { type: 'travel', exit: 'exit.zum-ufer' });
const q2Started = () => play(eveningDone(), { type: 'finishDialogue', dialogue: 'dlg.schnabbi.ausflug' }).state;
const reedsGathered = () =>
  play(
    toBay(q2Started()).state,
    { type: 'gather', map: BAY, spot: 'spot.schilf.links', at: T0 },
    { type: 'gather', map: BAY, spot: 'spot.schilf.rechts', at: T0 },
    { type: 'gather', map: BAY, spot: 'spot.schilf.wasser', at: T0 },
  ).state;
const matPlaced = () =>
  play(toShore(reedsGathered()).state, { type: 'craft', recipe: 'recipe.schilfmatte' }, { type: 'placeDeco', item: 'item.schilfmatte', map: MAP, tile: MAT })
    .state;
const q2Done = () => play(matPlaced(), { type: 'finishDialogue', dialogue: 'dlg.schnabbi.vertrauen' }).state;

/** Wie play(), aber mit eigenem Inhalt (für Datenbeispiele). */
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

describe('Ortswechsel', () => {
  it('geht nur von einer Ausgangskachel aus', () => {
    const r = play(fresh(), { type: 'travel', exit: 'exit.zur-bucht' });
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'invalidPosition' });
    expect(r.state.location.map).toBe(MAP);
  });

  it('eine Positionsmeldung kann den Ort nicht wechseln', () => {
    const r = play(fresh(), { type: 'arrive', map: BAY, tile: { x: 2, y: 24 }, facing: 'se' });
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'invalidPosition' });
    expect(r.state.location.map).toBe(MAP);
  });

  it('hin und zurück: die Figur landet jeweils sicher am Ankunftspunkt', () => {
    const there = toBay(fresh());
    expect(there.state.location).toEqual({ map: BAY, tile: { x: 2, y: 24 }, facing: 'se' });
    expect(there.events).toContainEqual({ type: 'traveled', exit: 'exit.zur-bucht', from: MAP, to: BAY });
    const back = toShore(there.state);
    expect(back.state.location).toEqual({ map: MAP, tile: { x: 13, y: 22 }, facing: 'sw' });
  });

  it('ist der Ankunftspunkt belegt (alter Spielstand), landet sie auf der nächsten freien Kachel', () => {
    const s = toBay(fresh()).state;
    s.deco.push({ uid: 'deco-9', item: 'item.uferleuchte', map: MAP, tile: { x: 13, y: 22 }, on: false });
    const back = toShore(s).state.location;
    expect(back.tile).not.toEqual({ x: 13, y: 22 });
    expect(standable(terrainAt(gridFor(content.maps[MAP]!), back.tile), ['land'])).toBe(true);
  });

  it('Deko darf weder auf den Ankunftspunkt noch den Weg zur Bucht versperren', () => {
    const s = eveningDone();
    expect(checkPlacement(s, content, MAP, { x: 13, y: 22 })?.reason).toBe('occupied'); // Ankunftspunkt
    expect(checkPlacement(s, content, MAP, { x: 14, y: 21 })?.reason).toBe('notPlaceable'); // Pfad
    for (const [i, t] of [[12, 20], [13, 20], [12, 21], [12, 22], [12, 23], [13, 23]].entries()) {
      s.deco.push({ uid: `w${i}`, item: 'item.uferleuchte', map: MAP, tile: { x: t[0]!, y: t[1]! }, on: false });
    }
    expect(checkPlacement(s, content, MAP, { x: 14, y: 23 })).toEqual({ reason: 'blocksPath', detail: 'den Weg zur Schilfbucht' });
  });

  it('in der Bucht lässt sich nichts aufstellen', () => {
    const s = play(toBay(eveningDone()).state).state;
    expect(checkPlacement(s, content, BAY, { x: 5, y: 21 })?.reason).toBe('outsideZone');
  });
});

describe('Zweites Erlebnis: Ein Platz für zwei', () => {
  it('nach dem ersten Abend weist ein Hinweis auf Schnabbis Idee hin', () => {
    const s = eveningDone();
    expect(activeHint(s, content)).toBe('Schnabbi hat eine Idee – sprich ihn an');
    expect(selectDialogue('schnabbi', s, content)?.id).toBe('dlg.schnabbi.ausflug');
  });

  it('das Schilf wächst erst, wenn Schnabbi davon erzählt hat', () => {
    const s = toBay(eveningDone()).state;
    const r = play(s, { type: 'gather', map: BAY, spot: 'spot.schilf.links', at: T0 });
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'notYet' });
    expect(r.state.inventory['item.schilfhalm']).toBeUndefined();
  });

  it('Schnabbi geht voraus in die Bucht – er steht dann nur dort, nicht doppelt', () => {
    const s = q2Started();
    expect(s.quests[Q2]).toEqual({ step: 'hinueber', done: false });
    expect(s.recipesKnown).toContain('recipe.schilfmatte');
    expect(resolveNpcs(s, content, MAP).map((n) => n.body)).not.toContain('body.schnabbi');
    expect(resolveNpcs(s, content, BAY)).toEqual([expect.objectContaining({ body: 'body.schnabbi', tile: { x: 7, y: 17 } })]);
  });

  it('in der Bucht ankommen schaltet weiter', () => {
    expect(toBay(q2Started()).state.quests[Q2]?.step).toBe('schilf');
  });

  it('drei Halme: Schnabbi geht zurück ans Licht, die Werkbank wartet', () => {
    const s = reedsGathered();
    expect(s.inventory['item.schilfhalm']).toBe(3);
    expect(s.quests[Q2]?.step).toBe('flechten');
    expect(resolveNpcs(s, content, BAY)).toEqual([]);
    expect(resolveNpcs(s, content, MAP)).toEqual([expect.objectContaining({ body: 'body.schnabbi', tile: { x: 9, y: 17 }, pose: 'sit' })]);
  });

  it('ein Halm zweimal antippen gibt nur einen', () => {
    const s = toBay(q2Started()).state;
    const r = play(s, { type: 'gather', map: BAY, spot: 'spot.schilf.links', at: T0 }, { type: 'gather', map: BAY, spot: 'spot.schilf.links', at: T0 });
    expect(r.state.inventory['item.schilfhalm']).toBe(1);
  });

  it('nach dem Hinlegen setzt sich Schnabbi zur Matte und spricht von selbst', () => {
    const s = matPlaced();
    expect(s.quests[Q2]?.step).toBe('gemeinsam');
    expect(resolveNpcs(s, content, MAP)).toEqual([expect.objectContaining({ body: 'body.schnabbi', tile: { x: 6, y: 21 }, talk: true })]);
  });

  it('das Gespräch gibt Moment und Freischaltung genau einmal', () => {
    const r = play(
      matPlaced(),
      { type: 'finishDialogue', dialogue: 'dlg.schnabbi.vertrauen' },
      { type: 'finishDialogue', dialogue: 'dlg.schnabbi.vertrauen' },
    );
    expect(r.state.quests[Q2]).toEqual({ step: 'gemeinsam', done: true });
    expect(r.state.moments).toEqual(['moment.schnabbi.erster-abend', 'moment.schnabbi.platz-fuer-zwei']);
    expect(r.state.unlocked).toEqual(['otter', 'schnabbi']);
    expect(r.events.filter((e) => e.type === 'unlocked')).toHaveLength(1);
    expect(r.events.filter((e) => e.type === 'questDone')).toHaveLength(1);
  });

  it('das Freundebuch zeigt Schnabbi, sobald man sich kennt', () => {
    expect(friendList(fresh(), content)).toEqual(['otter']);
    expect(friendList(afterGreeting(), content)).toEqual(['otter', 'schnabbi']);
  });
});

describe('Figurenwechsel', () => {
  it('ist gesperrt, bis Schnabbi ihr vertraut', () => {
    const r = play(eveningDone(), { type: 'switchCharacter', character: 'schnabbi' });
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'locked' });
  });

  it('als Schnabbi: sein NPC verschwindet, der Otter ruht vor dem Bau, jeder Körper genau einmal', () => {
    const r = play(q2Done(), { type: 'switchCharacter', character: 'schnabbi' });
    expect(r.state.activeCharacter).toBe('schnabbi');
    expect(r.events).toContainEqual({ type: 'switched', character: 'schnabbi', body: 'body.schnabbi', bodyChanged: true });
    const npcs = resolveAllNpcs(r.state, content);
    expect(npcs.map((n) => n.body)).toEqual(['body.otter']);
    expect(npcs[0]).toMatchObject({ map: MAP, tile: { x: 5, y: 25 } });
  });

  it('steht am Ruheplatz des Otters schon Deko (alter Spielstand), ruht er daneben', () => {
    const s = play(q2Done(), { type: 'switchCharacter', character: 'schnabbi' }).state;
    s.deco.push({ uid: 'alt-1', item: 'item.uferleuchte', map: MAP, tile: { x: 5, y: 25 }, on: false });
    const otter = resolveAllNpcs(s, content).find((n) => n.body === 'body.otter');
    expect(otter?.tile).toEqual({ x: 6, y: 25 });
  });

  it('als Schnabbi in die Bucht und zurück, danach wieder als Otter', () => {
    let s = play(q2Done(), { type: 'switchCharacter', character: 'schnabbi' }).state;
    s = toBay(s).state;
    expect(s.location.map).toBe(BAY);
    s = toShore(s).state;
    s = play(s, { type: 'switchCharacter', character: 'otter' }).state;
    expect(s.activeCharacter).toBe('otter');
    expect(resolveNpcs(s, content, MAP)).toEqual([expect.objectContaining({ body: 'body.schnabbi', tile: { x: 6, y: 21 } })]);
  });

  it('eine Landfigur, die im Wasser übernimmt, landet sicher an Land', () => {
    const c: Content = JSON.parse(JSON.stringify(content));
    c.bodies['body.maus'] = { id: 'body.maus', sprite: 'characters.otter', moves: ['land'], speed: { land: 40, water: 0 } };
    c.characters.maus = { id: 'maus', name: 'Testmaus', body: 'body.maus' };
    const s = newGame(c);
    s.unlocked.push('maus');
    s.location = { map: MAP, tile: { x: 6, y: 11 }, facing: 'se' }; // draußen im Wasser
    const r = playWith(c, s, { type: 'switchCharacter', character: 'maus' });
    const t = r.state.location.tile;
    expect(terrainAt(gridFor(c.maps[MAP]!), t)).not.toBe('water');
    expect(standable(terrainAt(gridFor(c.maps[MAP]!), t), ['land'])).toBe(true);
  });

  it('der Spielstand merkt sich Figur und Freischaltung (Code hin und zurück)', () => {
    const s = play(q2Done(), { type: 'switchCharacter', character: 'schnabbi' }).state;
    const back = importCode(exportCode(s));
    expect(normalizeState(back.state, back.schema, content).state).toEqual(s);
  });

  it('eine nicht freigeschaltete aktive Figur im Spielstand fällt auf den Otter zurück', () => {
    const s = { ...eveningDone(), activeCharacter: 'schnabbi' };
    const { state, notes } = normalizeState(JSON.parse(JSON.stringify(s)), 2, content);
    expect(state.activeCharacter).toBe('otter');
    expect(notes.length).toBeGreaterThan(0);
  });
});

describe('Migration', () => {
  it('ein Spielstand aus Version 0.2.0 (Schema 1) wird vollständig übernommen', async () => {
    const old = JSON.parse(JSON.stringify(eveningDone())) as Record<string, unknown>;
    delete old.unlocked;
    old.schema = 1;
    const mem = new MemoryStore();
    mem.data.set('otterwelt.save.a', JSON.stringify({ schema: 1, seq: 7, savedAt: 0, check: checksum(JSON.stringify(old)), state: old }));
    const loaded = await new SaveStore(mem).load(content);
    expect(loaded.problem).toBeNull();
    const s = loaded.state!;
    expect(s.schema).toBe(3);
    expect(s.regrow).toEqual({});
    expect(s.tracked).toBeNull();
    expect(s.unlocked).toEqual(['otter']);
    expect(s.player.name).toBe('Lina');
    expect(s.quests['quest.schnabbi.licht']?.done).toBe(true);
    expect(s.deco).toEqual([{ uid: 'deco-1', item: 'item.uferleuchte', map: MAP, tile: LAMP, on: true }]);
    expect(s.moments).toEqual(['moment.schnabbi.erster-abend']);
    // ... und es geht nahtlos mit Phase 2 weiter
    expect(selectDialogue('schnabbi', s, content)?.id).toBe('dlg.schnabbi.ausflug');
  });
});

describe('Erbsentrio (Datenbeispiel vor der Produktion)', () => {
  // Drei Figuren, ein Schalenkörper. Nur als Testinhalt – im Spiel gibt es das Trio noch nicht.
  const trio = (): Content => {
    const c: Content = JSON.parse(JSON.stringify(content));
    c.bodies['body.erbsenschale'] = { id: 'body.erbsenschale', sprite: 'characters.otter', moves: ['land'], speed: { land: 28, water: 0 }, seats: 3 };
    for (const [i, id] of ['beano', 'beani', 'beanz'].entries()) {
      c.characters[id] = { id, name: id[0]!.toUpperCase() + id.slice(1), body: 'body.erbsenschale', seat: i };
    }
    c.encounters.push({
      id: 'enc.erbsen',
      characters: ['beano', 'beani', 'beanz'],
      placements: [{ map: MAP, at: { tile: { x: 7, y: 27 } }, pose: 'idle', facing: 'se' }],
    });
    return c;
  };
  const withTrio = (c: Content) => {
    const s = newGame(c);
    s.unlocked.push('beano', 'beani', 'beanz');
    return s;
  };

  it('der Inhalt mit Trio ist gültig', () => {
    expect(validateContent(trio(), assetKeys())).toEqual([]);
  });

  it('in der Welt steht genau eine Schale mit allen drei Erbsen', () => {
    const c = trio();
    const bowls = resolveAllNpcs(withTrio(c), c).filter((n) => n.body === 'body.erbsenschale');
    expect(bowls).toHaveLength(1);
    expect(bowls[0]!.characters).toEqual(['beano', 'beani', 'beanz']);
  });

  it('als Beano gespielt: die Schale gehört der Spielerin, keine zweite steht herum', () => {
    const c = trio();
    const r = playWith(c, withTrio(c), { type: 'switchCharacter', character: 'beano' });
    expect(r.state.activeCharacter).toBe('beano');
    expect(resolveAllNpcs(r.state, c).map((n) => n.body).sort()).toEqual(['body.otter', 'body.schnabbi']);
  });

  it('von Beano zu Beani: gleicher Körper, gleicher Platz – nur wer spricht, ändert sich', () => {
    const c = trio();
    const asBeano = playWith(c, withTrio(c), { type: 'switchCharacter', character: 'beano' }).state;
    const r = playWith(c, asBeano, { type: 'switchCharacter', character: 'beani' });
    expect(r.state.activeCharacter).toBe('beani');
    expect(r.state.location).toEqual(asBeano.location);
    expect(r.events).toContainEqual({ type: 'switched', character: 'beani', body: 'body.erbsenschale', bodyChanged: false });
  });

  it('Speichern und Laden vervielfältigt die Schale nicht', () => {
    const c = trio();
    const s = playWith(c, withTrio(c), { type: 'switchCharacter', character: 'beanz' }).state;
    const back = importCode(exportCode(s));
    const loaded = normalizeState(back.state, back.schema, c).state;
    expect(loaded.activeCharacter).toBe('beanz');
    expect(resolveAllNpcs(loaded, c).filter((n) => n.body === 'body.erbsenschale')).toHaveLength(0);
    const asOtter = playWith(c, loaded, { type: 'switchCharacter', character: 'otter' }).state;
    expect(resolveAllNpcs(asOtter, c).filter((n) => n.body === 'body.erbsenschale')).toHaveLength(1);
  });

  it('die Prüfung verbietet eine zweite Begegnung für denselben Körper und gemischte Körper', () => {
    const c = trio();
    c.encounters.push({ id: 'enc.erbsen2', characters: ['beani'], placements: [{ map: MAP, at: { tile: { x: 9, y: 27 } }, pose: 'idle', facing: 'se' }] });
    c.encounters.push({ id: 'enc.gemischt', characters: ['beano', 'schnabbi'], placements: [] });
    const errors = validateContent(c, assetKeys());
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining('enc.erbsen2'), expect.stringContaining('verschiedenen Körpern')]),
    );
  });
});

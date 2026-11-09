// Wegkarte: besuchte Orte, Reisen über die Karte, Migration von 0.7.0.
import { describe, expect, it } from 'vitest';
import { content, fresh, MAP, play, rejected, T0 } from './helpers';
import { BAY, CAFE, phase2Done, travel, ZOO } from './progress';
import type { Content } from '../src/content/types';
import { reduce } from '../src/game/reduce';
import { normalizeState } from '../src/game/save/normalize';
import { newGame } from '../src/game/state';
import { wegkarte } from '../src/game/text';

describe('Wegkarte anzeigen', () => {
  it('am Anfang: das Startufer (hier) und seine drei Nachbarn als unbekannte Orte', () => {
    const { orte, wege } = wegkarte(fresh(), content);
    const byId = Object.fromEntries(orte.map((o) => [o.id, o]));
    expect(byId[MAP]).toMatchObject({ besucht: true, hier: true, neuigkeit: true }); // Schnabbi wartet
    expect(Object.keys(byId).sort()).toEqual([MAP, BAY, 'map.tiramisu-stream', ZOO].sort());
    expect(byId[BAY]!.besucht).toBe(false);
    expect(wege).toHaveLength(3);
  });

  it('jeder betretene Ort wird gemerkt und zeigt seine eigenen Nachbarn', () => {
    let s = travel(fresh(), MAP, { x: 7, y: 31 }, 'exit.zum-zoo');
    expect(s.visited).toEqual([MAP, ZOO]);
    const ids = wegkarte(s, content).orte.map((o) => o.id);
    expect(ids).toEqual(expect.arrayContaining([CAFE, 'map.hotpot-restaurant']));
    s = travel(s, ZOO, { x: 7, y: 0 }, 'exit.zum-ufer');
    expect(s.visited).toEqual([MAP, ZOO]); // nichts doppelt
  });
});

describe('Reisen über die Wegkarte', () => {
  it('nur zu besuchten Orten, nicht dorthin, wo sie schon ist', () => {
    const s = fresh();
    expect(rejected(play(s, { type: 'fastTravel', map: ZOO }).events)[0]).toMatchObject({ reason: 'locked' });
    expect(rejected(play(s, { type: 'fastTravel', map: MAP }).events)[0]).toMatchObject({ reason: 'alreadyHere' });
  });

  it('landet am sicheren Platz des Ortes und kann zurück', () => {
    let s = travel(fresh(), MAP, { x: 7, y: 31 }, 'exit.zum-zoo');
    s = travel(s, ZOO, { x: 7, y: 0 }, 'exit.zum-ufer');
    const r = play(s, { type: 'fastTravel', map: ZOO });
    expect(r.state.location).toEqual({ map: ZOO, tile: content.maps[ZOO]!.arrival, facing: 'se' });
    expect(r.events).toContainEqual({ type: 'traveled', exit: null, from: MAP, to: ZOO });
    const back = play(r.state, { type: 'fastTravel', map: MAP }).state;
    expect(back.location).toEqual({ map: MAP, tile: content.maps[MAP]!.arrival, facing: 'se' });
  });

  it('Aufgaben, die auf einen Ort warten, zählen auch bei einer Reise über die Karte', () => {
    // Die Bucht schon vor Schnabbis Idee besucht, dann über die Karte hin
    let s = travel(fresh(), MAP, { x: 14, y: 21 }, 'exit.zur-bucht');
    s = travel(s, BAY, { x: 1, y: 24 }, 'exit.zum-ufer');
    s.quests['quest.schnabbi.schilf'] = { step: 'hinueber', done: false };
    const r = play(s, { type: 'fastTravel', map: BAY });
    expect(r.state.quests['quest.schnabbi.schilf']?.step).toBe('schilf');
  });

  it('eine Figur, die nur schwimmen kann, reist nicht an einen Ort ohne Wasser', () => {
    const c: Content = JSON.parse(JSON.stringify(content));
    c.bodies['body.fisch'] = { id: 'body.fisch', sprite: 'characters.rosie', moves: ['water'], speed: { land: 0, water: 30 } };
    c.characters.fisch = { id: 'fisch', name: 'Testfisch', body: 'body.fisch' };
    const s = newGame(c);
    s.visited.push(CAFE);
    s.unlocked.push('fisch');
    s.activeCharacter = 'fisch';
    s.location = { map: MAP, tile: { x: 6, y: 11 }, facing: 'se' };
    const r = reduce(s, { type: 'fastTravel', map: CAFE }, c);
    expect(r.changed).toBe(false);
    expect(r.events[0]).toMatchObject({ type: 'rejected', reason: 'invalidPosition' });
  });
});

describe('Migration von 0.7.0 (Schema 3)', () => {
  it('besuchte Orte werden aus dem Spielstand abgeleitet', () => {
    const s = phase2Done();
    const old = JSON.parse(JSON.stringify(s)) as Record<string, unknown>;
    delete old.visited;
    old.schema = 3;
    old.regrow = { 'map.schilfbucht/spot.schilf.links': T0 + 600_000 };
    const { state } = normalizeState(old, 3, content);
    expect(state.visited).toEqual(expect.arrayContaining([MAP, BAY]));
    expect(state.visited).not.toContain(ZOO);
  });
});

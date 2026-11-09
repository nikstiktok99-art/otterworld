// Kapitel Tiramisu Stream: Lumi (Otterprinzessin), Rosie und Bubbles.
import { describe, expect, it } from 'vitest';
import { afterGreeting, allGathered, content, fresh, MAP, play, rejected, T0 } from './helpers';
import type { Action } from '../src/game/actions';
import type { GameState } from '../src/game/types';
import { resolveAllNpcs, resolveNpcs } from '../src/game/occupancy';
import { activeHint, friendList, hasNews, selectDialogue } from '../src/game/text';
import { gridFor, terrainAt } from '../src/game/space';

const BAY = 'map.schilfbucht';
const BACH = 'map.tiramisu-stream';
const Q3 = 'quest.lumi.picknick';
const Q4 = 'quest.rosie.kissen';
const MIN = 60_000;

function phase2Done(): GameState {
  return play(
    allGathered(afterGreeting()),
    { type: 'craft', recipe: 'recipe.uferleuchte' },
    { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: { x: 8, y: 17 } },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.ausflug' },
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
}

const toBach = (s: GameState) =>
  play(s, { type: 'arrive', map: MAP, tile: { x: 1, y: 27 }, facing: 'sw' }, { type: 'travel', exit: 'exit.zum-bach' }).state;

const g = (spot: string, at = T0 + 20 * MIN): Action => ({ type: 'gather', map: BACH, spot, at });

function picknickDone(): GameState {
  let s = toBach(phase2Done());
  s = play(
    s,
    { type: 'finishDialogue', dialogue: 'dlg.lumi.hallo' },
    g('spot.bluete.wiese'),
    g('spot.bluete.links'),
    g('spot.bluete.rechts'),
    g('spot.kiesel.rechts'),
    { type: 'craft', recipe: 'recipe.bluetengirlande' },
    { type: 'placeDeco', item: 'item.bluetengirlande', map: BACH, tile: { x: 12, y: 13 } },
    { type: 'finishDialogue', dialogue: 'dlg.lumi.picknick' },
  ).state;
  return s;
}

describe('Tiramisu Stream: Ort und Weg', () => {
  it('der Weg links neben dem Bau führt hin und zurück', () => {
    const there = toBach(fresh());
    expect(there.location).toEqual({ map: BACH, tile: { x: 13, y: 27 }, facing: 'sw' });
    const back = play(there, { type: 'arrive', map: BACH, tile: { x: 14, y: 27 }, facing: 'se' }, { type: 'travel', exit: 'exit.zum-ufer' }).state;
    expect(back.location).toEqual({ map: MAP, tile: { x: 2, y: 27 }, facing: 'se' });
  });

  it('Rosie und Bubbles leben im Wasser, Bubbles macht Blasen', () => {
    const npcs = resolveNpcs(fresh(), content, BACH);
    const grid = gridFor(content.maps[BACH]!);
    for (const body of ['body.rosie', 'body.bubbles']) {
      const n = npcs.find((x) => x.body === body);
      expect(n).toBeDefined();
      expect(terrainAt(grid, n!.tile)).toBe('water');
    }
    expect(content.bodies['body.bubbles']!.traits).toContain('blasen');
    expect(content.bodies['body.rosie']!.moves).toEqual(['water']);
  });
});

describe('Lumi: Begegnung nach Schnabbi', () => {
  it('ist erst da, wenn Schnabbis zweites Erlebnis geschafft ist', () => {
    expect(resolveAllNpcs(afterGreeting(), content).some((n) => n.body === 'body.otterprinzessin')).toBe(false);
    const s = phase2Done();
    expect(resolveNpcs(s, content, BACH)).toEqual(expect.arrayContaining([expect.objectContaining({ body: 'body.otterprinzessin', tile: { x: 12, y: 17 } })]));
    expect(hasNews('otterprinzessin', s, content)).toBe(true);
    expect(activeHint(s, content)).toContain('Tiramisu Stream');
  });

  it('Picknick: sammeln, basteln, aufhängen – Lumi setzt sich dazu und spricht von selbst', () => {
    let s = play(toBach(phase2Done()), { type: 'finishDialogue', dialogue: 'dlg.lumi.hallo' }).state;
    expect(s.quests[Q3]?.step).toBe('sammeln');
    expect(s.recipesKnown).toContain('recipe.bluetengirlande');
    s = play(s, g('spot.bluete.wiese'), g('spot.bluete.links'), g('spot.bluete.rechts'), g('spot.kiesel.rechts')).state;
    expect(s.quests[Q3]?.step).toBe('basteln');
    s = play(s, { type: 'craft', recipe: 'recipe.bluetengirlande' }).state;
    expect(s.quests[Q3]?.step).toBe('aufhaengen');
    s = play(s, { type: 'placeDeco', item: 'item.bluetengirlande', map: BACH, tile: { x: 12, y: 13 } }).state;
    expect(s.quests[Q3]?.step).toBe('picknick');
    expect(resolveNpcs(s, content, BACH).find((n) => n.body === 'body.otterprinzessin')).toMatchObject({ tile: { x: 13, y: 13 }, talk: true });
  });

  it('am Ende: Moment, Kiesellicht-Rezept und Lumi spielbar – alles genau einmal', () => {
    const s = picknickDone();
    const again = play(s, { type: 'finishDialogue', dialogue: 'dlg.lumi.picknick' });
    expect(again.state).toBe(s);
    expect(s.quests[Q3]).toEqual({ step: 'picknick', done: true });
    expect(s.moments).toContain('moment.lumi.picknick');
    expect(s.recipesKnown).toContain('recipe.kiesellicht');
    expect(s.unlocked).toContain('otterprinzessin');
    expect(friendList(s, content)).toContain('otterprinzessin');
  });

  it('als Lumi spielen: ihr NPC ist weg, jeder Körper höchstens einmal', () => {
    const s = play(picknickDone(), { type: 'switchCharacter', character: 'otterprinzessin' }).state;
    const bodies = resolveAllNpcs(s, content).map((n) => n.body);
    expect(bodies).not.toContain('body.otterprinzessin');
    expect(new Set(bodies).size).toBe(bodies.length);
  });
});

describe('Rosie und Bubbles: ein Kissen für Rosie', () => {
  it('vor dem Picknick sind sie noch scheu, danach hat Rosie etwas für dich', () => {
    expect(selectDialogue('rosie', phase2Done(), content)?.id).toBe('dlg.rosie.fremd');
    const s = picknickDone();
    expect(selectDialogue('rosie', s, content)?.id).toBe('dlg.rosie.hallo');
    expect(hasNews('rosie', s, content)).toBe(true);
    expect(hasNews('bubbles', s, content)).toBe(false);
  });

  it('Kissen basteln und abgeben: Rosie nimmt es, Bubbles schenkt zwei Glitzerkiesel – genau einmal', () => {
    let s = play(picknickDone(), { type: 'finishDialogue', dialogue: 'dlg.rosie.hallo' }).state;
    expect(s.quests[Q4]?.step).toBe('sammeln');
    const later = T0 + 40 * MIN; // Blüten sind nachgewachsen
    s = play(s, g('spot.seerose.links', later), g('spot.seerose.rechts', later), g('spot.bluete.wiese', later)).state;
    expect(s.quests[Q4]?.step).toBe('basteln');
    s = play(s, { type: 'craft', recipe: 'recipe.seerosenkissen' }).state;
    expect(s.quests[Q4]?.step).toBe('bringen');
    expect(selectDialogue('rosie', s, content)?.id).toBe('dlg.rosie.danke');
    const kiesel = s.inventory['item.glitzerkiesel'] ?? 0;
    const r = play(s, { type: 'finishDialogue', dialogue: 'dlg.rosie.danke' }, { type: 'finishDialogue', dialogue: 'dlg.rosie.danke' });
    expect(r.state.inventory['item.seerosenkissen']).toBeUndefined();
    expect(r.state.inventory['item.glitzerkiesel']).toBe(kiesel + 2);
    expect(r.state.quests[Q4]?.done).toBe(true);
    expect(r.state.moments).toEqual(expect.arrayContaining(['moment.rosie.kissen', 'moment.bubbles.kissen']));
    expect(friendList(r.state, content)).toEqual(expect.arrayContaining(['rosie', 'bubbles']));
  });

  it('liegt das Kissen schon als Deko, erinnert Rosie ans Einpacken – danach klappt die Übergabe', () => {
    let s = play(picknickDone(), { type: 'finishDialogue', dialogue: 'dlg.rosie.hallo' }).state;
    const later = T0 + 40 * MIN;
    s = play(s, g('spot.seerose.links', later), g('spot.seerose.rechts', later), g('spot.bluete.wiese', later), { type: 'craft', recipe: 'recipe.seerosenkissen' }).state;
    s = play(s, { type: 'placeDeco', item: 'item.seerosenkissen', map: BACH, tile: { x: 11, y: 10 } }).state;
    expect(selectDialogue('rosie', s, content)?.id).toBe('dlg.rosie.bringen');
    expect(rejected(play(s, { type: 'finishDialogue', dialogue: 'dlg.rosie.danke' }).events)[0]).toMatchObject({ reason: 'missingItems' });
    const uid = s.deco.find((d) => d.item === 'item.seerosenkissen')!.uid;
    s = play(s, { type: 'pickUpDeco', uid }).state;
    expect(selectDialogue('rosie', s, content)?.id).toBe('dlg.rosie.danke');
  });
});

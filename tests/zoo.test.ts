// Kapitel Zoo: Meerkat (Erdmännchen) und Squichy (Mini-Robbe).
import { describe, expect, it } from 'vitest';
import { content, fresh, MAP, play, T0 } from './helpers';
import { BAY, bachDone, travel, ZOO } from './progress';
import type { GameState } from '../src/game/types';
import { resolveNpcs } from '../src/game/occupancy';
import { matches } from '../src/game/conditions';
import { activeHint, friendList, hasNews, selectDialogue } from '../src/game/text';
import { gridFor, terrainAt } from '../src/game/space';

const MIN = 60_000;
const Q5 = 'quest.meerkat.wimpel';
const Q6 = 'quest.squichy.ball';
const later = T0 + 90 * MIN;

const toZoo = (s: GameState) => travel(s, MAP, { x: 7, y: 31 }, 'exit.zum-zoo');

function wimpelDone(): GameState {
  // Treibholz am Startufer, dann in den Zoo
  let s = play(bachDone(), { type: 'gather', map: MAP, spot: 'spot.treibholz.strand', at: later }).state;
  s = toZoo(s);
  return play(
    s,
    { type: 'finishDialogue', dialogue: 'dlg.meerkat.hallo' },
    { type: 'gather', map: ZOO, spot: 'spot.feder.gehege', at: later },
    { type: 'gather', map: ZOO, spot: 'spot.feder.wiese', at: later },
    { type: 'craft', recipe: 'recipe.federwimpel' },
    { type: 'finishDialogue', dialogue: 'dlg.meerkat.danke' },
  ).state;
}

describe('Zoo: Ort und Bewohner', () => {
  it('der Weg unten am Startufer führt hin und zurück', () => {
    const there = toZoo(fresh());
    expect(there.location).toEqual({ map: ZOO, tile: { x: 7, y: 2 }, facing: 'se' });
    const back = travel(there, ZOO, { x: 7, y: 0 }, 'exit.zum-ufer');
    expect(back.location).toEqual({ map: MAP, tile: { x: 7, y: 30 }, facing: 'ne' });
  });

  it('Meerkat steht im Gehege an Land, Squichy schwimmt im Becken', () => {
    const npcs = resolveNpcs(fresh(), content, ZOO);
    const grid = gridFor(content.maps[ZOO]!);
    expect(terrainAt(grid, npcs.find((n) => n.body === 'body.meerkat')!.tile)).toBe('sand');
    expect(terrainAt(grid, npcs.find((n) => n.body === 'body.squichy')!.tile)).toBe('water');
    expect(content.bodies['body.meerkat']!.moves).toEqual(['land']);
  });

  it('vor dem Teich-Kapitel sind beide noch beschäftigt', () => {
    expect(selectDialogue('meerkat', fresh(), content)?.id).toBe('dlg.meerkat.fremd');
    expect(selectDialogue('squichy', fresh(), content)?.id).toBe('dlg.squichy.fremd');
  });
});

describe('Ein Wimpel für Meerkat', () => {
  it('nach Rosies Kissen hat Meerkat etwas für dich', () => {
    const s = bachDone();
    expect(hasNews('meerkat', s, content)).toBe(true);
    expect(activeHint(s, content)).toContain('Zoo');
  });

  it('Federn, Treibholz, Wimpel basteln, abgeben: Sonnenblumenkerne, Moment und Rezept genau einmal', () => {
    const s = wimpelDone();
    expect(s.quests[Q5]).toEqual({ step: 'bringen', done: true });
    expect(s.inventory['item.federwimpel']).toBeUndefined();
    expect(s.inventory['item.sonnenblumenkern']).toBe(2);
    expect(s.moments).toContain('moment.meerkat.wimpel');
    expect(s.recipesKnown).toContain('recipe.sonnenblumentopf');
    const again = play(s, { type: 'finishDialogue', dialogue: 'dlg.meerkat.danke' });
    expect(again.state).toBe(s);
  });

  it('danach steht der Wimpel auf dem Aussichtsstein', () => {
    const stone = content.maps[ZOO]!.objects.find((o) => o.id === 'obj.aussichtsstein')!;
    const variant = (s: GameState) => stone.variants?.find((v) => matches(v.when, s))?.sprite ?? stone.sprite;
    expect(variant(bachDone())).toBe('objects.aussichtsstein');
    expect(variant(wimpelDone())).toBe('objects.aussichtsstein.wimpel');
  });

  it('aus den Kernen und einer Muschel wird ein Sonnenblumentopf', () => {
    let s = play(wimpelDone(), { type: 'gather', map: ZOO, spot: 'spot.feder.unten', at: later }).state;
    s = travel(s, ZOO, { x: 7, y: 0 }, 'exit.zum-ufer');
    s = play(s, { type: 'gather', map: MAP, spot: 'spot.muschel.sand', at: later }, { type: 'craft', recipe: 'recipe.sonnenblumentopf' }).state;
    expect(s.inventory['item.sonnenblumentopf']).toBe(1);
  });
});

describe('Ein Ball für Squichy', () => {
  it('nach Meerkats Wimpel hat Squichy etwas für dich', () => {
    const s = wimpelDone();
    expect(hasNews('squichy', s, content)).toBe(true);
    expect(selectDialogue('squichy', s, content)?.id).toBe('dlg.squichy.hallo');
  });

  it('Schilf aus der Bucht holen, Ball basteln, abgeben: Muscheln, Moment, beide im Freundebuch', () => {
    let s = play(wimpelDone(), { type: 'finishDialogue', dialogue: 'dlg.squichy.hallo' }).state;
    expect(s.quests[Q6]?.step).toBe('sammeln');
    s = travel(s, ZOO, { x: 7, y: 0 }, 'exit.zum-ufer');
    s = travel(s, MAP, { x: 14, y: 21 }, 'exit.zur-bucht');
    s = play(s, { type: 'gather', map: BAY, spot: 'spot.schilf.links', at: later }, { type: 'gather', map: BAY, spot: 'spot.schilf.rechts', at: later }).state;
    expect(s.quests[Q6]?.step).toBe('basteln'); // Glitzerkiesel hat Bubbles geschenkt
    s = play(s, { type: 'craft', recipe: 'recipe.schilfball' }).state;
    expect(s.quests[Q6]?.step).toBe('bringen');
    const muscheln = s.inventory['item.muschelschale'] ?? 0;
    const r = play(s, { type: 'finishDialogue', dialogue: 'dlg.squichy.danke' }, { type: 'finishDialogue', dialogue: 'dlg.squichy.danke' });
    expect(r.state.quests[Q6]?.done).toBe(true);
    expect(r.state.inventory['item.muschelschale']).toBe(muscheln + 2);
    expect(r.state.moments.filter((m) => m === 'moment.squichy.ball')).toHaveLength(1);
    expect(friendList(r.state, content)).toEqual(expect.arrayContaining(['meerkat', 'squichy']));
  });
});

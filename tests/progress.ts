// Spielfortschritt für Tests: Zustände nach den bisherigen Kapiteln (über die echten Spielregeln erzeugt).
import { afterGreeting, allGathered, MAP, play, T0 } from './helpers';
import type { Action } from '../src/game/actions';
import type { GameState } from '../src/game/types';

export const BAY = 'map.schilfbucht';
export const BACH = 'map.tiramisu-stream';
export const ZOO = 'map.zoo';
const MIN = 60_000;

const at = (map: string, spot: string, t: number): Action => ({ type: 'gather', map, spot, at: t });

/** Reisen: erst auf eine Ausgangskachel stellen, dann wechseln. */
export function travel(s: GameState, from: string, tile: { x: number; y: number }, exit: string): GameState {
  return play(s, { type: 'arrive', map: from, tile, facing: 'se' }, { type: 'travel', exit }).state;
}

/** Schnabbis zwei Erlebnisse geschafft (wieder am Startufer). */
export function phase2Done(): GameState {
  let s = play(
    allGathered(afterGreeting()),
    { type: 'craft', recipe: 'recipe.uferleuchte' },
    { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: { x: 8, y: 17 } },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.ausflug' },
  ).state;
  s = travel(s, MAP, { x: 14, y: 21 }, 'exit.zur-bucht');
  s = play(s, at(BAY, 'spot.schilf.links', T0), at(BAY, 'spot.schilf.rechts', T0), at(BAY, 'spot.schilf.wasser', T0)).state;
  s = travel(s, BAY, { x: 1, y: 24 }, 'exit.zum-ufer');
  return play(
    s,
    { type: 'craft', recipe: 'recipe.schilfmatte' },
    { type: 'placeDeco', item: 'item.schilfmatte', map: MAP, tile: { x: 5, y: 21 } },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.vertrauen' },
  ).state;
}

/** Tiramisu Stream komplett (Lumi und Rosie), wieder am Startufer. */
export function bachDone(): GameState {
  let s = travel(phase2Done(), MAP, { x: 1, y: 27 }, 'exit.zum-bach');
  const t1 = T0 + 20 * MIN;
  const t2 = T0 + 40 * MIN;
  s = play(
    s,
    { type: 'finishDialogue', dialogue: 'dlg.lumi.hallo' },
    at(BACH, 'spot.bluete.wiese', t1),
    at(BACH, 'spot.bluete.links', t1),
    at(BACH, 'spot.bluete.rechts', t1),
    at(BACH, 'spot.kiesel.rechts', t1),
    { type: 'craft', recipe: 'recipe.bluetengirlande' },
    { type: 'placeDeco', item: 'item.bluetengirlande', map: BACH, tile: { x: 12, y: 13 } },
    { type: 'finishDialogue', dialogue: 'dlg.lumi.picknick' },
    { type: 'finishDialogue', dialogue: 'dlg.rosie.hallo' },
    at(BACH, 'spot.seerose.links', t2),
    at(BACH, 'spot.seerose.rechts', t2),
    at(BACH, 'spot.bluete.wiese', t2),
    { type: 'craft', recipe: 'recipe.seerosenkissen' },
    { type: 'finishDialogue', dialogue: 'dlg.rosie.danke' },
  ).state;
  return travel(s, BACH, { x: 14, y: 27 }, 'exit.zum-ufer');
}

export const CAFE = 'map.cat-cafe';
export const HOTPOT = 'map.hotpot-restaurant';
export const WALD = 'map.fuchsbau';
const late = (n: number) => T0 + (100 + n * 20) * MIN;

/** Meerkats Wimpel geschafft, im Zoo. */
export function zooDone(): GameState {
  let s = play(bachDone(), at(MAP, 'spot.treibholz.strand', late(0))).state;
  s = travel(s, MAP, { x: 7, y: 31 }, 'exit.zum-zoo');
  return play(
    s,
    { type: 'finishDialogue', dialogue: 'dlg.meerkat.hallo' },
    at(ZOO, 'spot.feder.gehege', late(0)),
    at(ZOO, 'spot.feder.wiese', late(0)),
    { type: 'craft', recipe: 'recipe.federwimpel' },
    { type: 'finishDialogue', dialogue: 'dlg.meerkat.danke' },
  ).state;
}

/** Chamarons Kletterpflanze geschafft, im Cat Café. */
export function cafeDone(): GameState {
  const s = travel(zooDone(), ZOO, { x: 7, y: 31 }, 'exit.zum-cafe');
  return play(
    s,
    { type: 'finishDialogue', dialogue: 'dlg.chamaron.hallo' },
    at(CAFE, 'spot.tee.links', late(1)),
    at(CAFE, 'spot.tee.rechts', late(1)),
    at(CAFE, 'spot.wolle.oben', late(1)),
    { type: 'craft', recipe: 'recipe.kletterpflanze' },
    { type: 'placeDeco', item: 'item.kletterpflanze', map: CAFE, tile: { x: 8, y: 14 } },
    { type: 'finishDialogue', dialogue: 'dlg.chamaron.danke' },
  ).state;
}

/** Festessen mit den Erbsen geschafft, im Hotpot-Restaurant. */
export function hotpotDone(): GameState {
  let s = travel(cafeDone(), CAFE, { x: 7, y: 29 }, 'exit.zum-zoo');
  s = travel(s, ZOO, { x: 14, y: 24 }, 'exit.zum-hotpot');
  return play(
    s,
    { type: 'finishDialogue', dialogue: 'dlg.beano.hallo' },
    at(HOTPOT, 'spot.mehl.links', late(2)),
    at(HOTPOT, 'spot.mehl.rechts', late(2)),
    at(HOTPOT, 'spot.gemuese.links', late(2)),
    { type: 'craft', recipe: 'recipe.teigtaschen', station: 'kochtopf' },
    { type: 'finishDialogue', dialogue: 'dlg.beano.danke' },
  ).state;
}

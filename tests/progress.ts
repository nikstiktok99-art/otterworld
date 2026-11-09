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

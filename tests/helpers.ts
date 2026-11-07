import { content } from '../src/content';
import type { Action, GameEvent } from '../src/game/actions';
import { reduce } from '../src/game/reduce';
import { newGame } from '../src/game/state';
import type { GameState } from '../src/game/types';

export { content };
export const MAP = 'map.startufer';

/** Spielt Aktionen nacheinander ab und sammelt alle Ereignisse. */
export function play(state: GameState, ...actions: Action[]): { state: GameState; events: GameEvent[] } {
  let s = state;
  const events: GameEvent[] = [];
  for (const a of actions) {
    const r = reduce(s, a, content);
    s = r.state;
    events.push(...r.events);
  }
  return { state: s, events };
}

export const fresh = (): GameState => newGame(content);

/** Bis zum Start der Quest: Name setzen, Begrüßung beenden. */
export function afterGreeting(name = 'Lina'): GameState {
  return play(
    fresh(),
    { type: 'setPlayerName', name },
    { type: 'finishDialogue', dialogue: 'dlg.schnabbi.begruessung' },
  ).state;
}

export function allGathered(s: GameState): GameState {
  return play(
    s,
    { type: 'gather', map: MAP, spot: 'spot.treibholz.strand' },
    { type: 'gather', map: MAP, spot: 'spot.treibholz.wasser' },
    { type: 'gather', map: MAP, spot: 'spot.muschel.sand' },
  ).state;
}

export const rejected = (events: GameEvent[]) => events.filter((e) => e.type === 'rejected');

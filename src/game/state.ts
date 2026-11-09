import type { Content } from '../content/types';
import type { GameState } from './types';

export const SCHEMA = 4 as const;

export function newGame(content: Content): GameState {
  const map = content.maps[content.start.map];
  if (!map) throw new Error(`Start-Map fehlt: ${content.start.map}`);
  return {
    schema: SCHEMA,
    player: { name: null },
    activeCharacter: content.start.character,
    unlocked: [content.start.character],
    location: { map: map.id, tile: { ...map.arrival }, facing: 'se' },
    inventory: {},
    recipesKnown: [],
    gathered: [],
    regrow: {},
    quests: {},
    tracked: null,
    visited: [map.id],
    claimed: [],
    moments: [],
    deco: [],
    nextDecoId: 1,
    settings: { sound: true, haptics: true },
  };
}

export const count = (s: GameState, item: string): number => s.inventory[item] ?? 0;

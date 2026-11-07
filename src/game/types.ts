// Grundtypen des Spielzustands. Reines TypeScript – keine Imports aus Phaser, React oder Capacitor.

/** Blickrichtung in der schrägen Draufsicht: se = vorne rechts, sw = vorne links, ne = hinten rechts, nw = hinten links. */
export type Dir = 'se' | 'sw' | 'ne' | 'nw';

export interface Tile {
  x: number;
  y: number;
}

export interface PlacedDeco {
  uid: string;
  item: string;
  map: string;
  tile: Tile;
  on: boolean;
}

export interface QuestProgress {
  step: string;
  done: boolean;
}

export interface Settings {
  sound: boolean;
  haptics: boolean;
}

/** Der gespeicherte Spielstand. Enthält nur stabile IDs, nie Namen, Bilder oder Sprites. */
export interface GameState {
  schema: 1;
  player: { name: string | null };
  activeCharacter: string;
  location: { map: string; tile: Tile; facing: Dir };
  inventory: Record<string, number>;
  recipesKnown: string[];
  /** Eingesammelte Fundstellen als `${mapId}/${spotId}`. */
  gathered: string[];
  quests: Record<string, QuestProgress>;
  /** Einmalige Belohnungen, die bereits vergeben wurden. */
  claimed: string[];
  moments: string[];
  deco: PlacedDeco[];
  nextDecoId: number;
  settings: Settings;
}

export const sameTile = (a: Tile, b: Tile): boolean => a.x === b.x && a.y === b.y;

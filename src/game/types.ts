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
  schema: 3;
  player: { name: string | null };
  /** Wer gerade gespielt wird (Figuren-ID). Der Körper ergibt sich aus dem Inhalt. */
  activeCharacter: string;
  /** Spielbare Figuren. Die Startfigur ist immer dabei. */
  unlocked: string[];
  /** Ort und sichere Position der aktiven Figur. */
  location: { map: string; tile: Tile; facing: Dir };
  inventory: Record<string, number>;
  recipesKnown: string[];
  /** Eingesammelte einmalige Fundstellen als `${mapId}/${spotId}`. */
  gathered: string[];
  /** Nachwachsende Fundstellen: `${mapId}/${spotId}` -> Zeitpunkt (ms), ab dem sie wieder da ist. */
  regrow: Record<string, number>;
  quests: Record<string, QuestProgress>;
  /** Die Aufgabe, deren Hinweis oben angezeigt wird (null = die zuerst begonnene offene). */
  tracked: string | null;
  /** Einmalige Belohnungen, die bereits vergeben wurden. */
  claimed: string[];
  moments: string[];
  deco: PlacedDeco[];
  nextDecoId: number;
  settings: Settings;
}

export const sameTile = (a: Tile, b: Tile): boolean => a.x === b.x && a.y === b.y;

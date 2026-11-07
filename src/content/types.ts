// Typen der Inhaltsdaten. Inhalte sind reine Daten: Figuren, Körper, Orte, Gegenstände, Rezepte, Quests, Dialoge.
import type { Dir, Tile } from '../game/types';

export type Terrain = 'water' | 'sand' | 'grass' | 'steg' | 'blocked';
export type Movement = 'land' | 'water';

/** Bedingungen über den Spielstand – für Dialogauswahl, Aufenthaltsorte und Freischaltungen. */
export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { hasName: boolean }
  | { questNotStarted: string }
  | { questStep: { quest: string; step: string } }
  | { questDone: string }
  | { hasMoment: string };

/** Wirkungen, z. B. am Ende eines Dialogs oder eines Questschritts. Alle sind idempotent. */
export type Effect =
  | { startQuest: string }
  | { learnRecipe: string }
  | { addMoment: string }
  | { setDecoOn: { item: string; on: boolean } };

export type Trigger =
  | { hasItems: Record<string, number> }
  | { crafted: string }
  | { placed: string }
  | { dialogue: string };

export type CharacterName = string | { fromPlayer: true; fallback: string };

export interface CharacterDef {
  id: string;
  name: CharacterName;
  /** Weltkörper, den diese Figur benutzt. Mehrere Figuren können denselben Körper teilen (z. B. das Erbsentrio). */
  body: string;
  /** Sitzplatz im gemeinsamen Körper (nur bei Körpern mit mehreren Sitzen). */
  seat?: number;
  /** Grafikschlüssel des Dialogporträts. */
  portrait?: string;
}

export interface BodyDef {
  id: string;
  /** Basis-Grafikschlüssel, z. B. 'characters.otter'. */
  sprite: string;
  moves: Movement[];
  /** Geschwindigkeit in Weltpixeln pro Sekunde. */
  speed: { land: number; water: number };
  seats?: number;
}

export interface ItemDef {
  id: string;
  name: string;
  plural: string;
  kind: 'material' | 'deco';
  /** Grafikschlüssel in der Welt (Fundstelle oder aufgestellte Deko). */
  sprite: string;
  deco?: {
    /** Grafikschlüssel für den eingeschalteten Zustand. */
    spriteOn?: string;
    /** Darf erst ein- und ausgeschaltet werden, wenn diese Bedingung gilt. */
    toggleWhen?: Condition;
    toggleNotYetText?: string;
  };
}

export interface RecipeDef {
  id: string;
  name: string;
  inputs: Record<string, number>;
  output: { item: string; count: number };
}

export interface MapObjectDef {
  id: string;
  name: string;
  sprite: string;
  /** Linke obere Kachel der Grundfläche. */
  tile: Tile;
  footprint: { w: number; h: number };
  interaction?: { kind: 'workbench' } | { kind: 'inspect'; text: string };
}

export interface GatherSpotDef {
  id: string;
  item: string;
  count: number;
  tile: Tile;
  sprite: string;
}

export type PlacementTarget = { tile: Tile } | { besideDeco: string };

export interface EncounterDef {
  id: string;
  characters: string[];
  /** Die erste passende Platzierung gilt. */
  placements: Array<{
    when?: Condition;
    at: PlacementTarget;
    pose: 'idle' | 'sit';
    facing: Dir;
    /** Nach dem Hinlaufen von selbst das Gespräch beginnen, solange diese Bedingung gilt. */
    talkOnArrival?: Condition;
  }>;
}

export interface MapDef {
  id: string;
  name: string;
  /** Eine Zeile pro Kachelreihe, ein Zeichen pro Kachel. */
  grid: string[];
  legend: Record<string, Terrain>;
  arrival: Tile;
  objects: MapObjectDef[];
  gatherSpots: GatherSpotDef[];
  encounters: EncounterDef[];
  decorZone: { x: number; y: number; w: number; h: number };
  /** Diese Kacheln müssen zu Fuß erreichbar bleiben (z. B. der Steg). */
  keepReachable: Array<{ tile: Tile; name: string }>;
  ambience?: string;
}

export interface QuestStepDef {
  id: string;
  /** Kurzer Hinweis in der Anzeige oben. Platzhalter: {count:item.x}. */
  hint: string;
  completeWhen: Trigger;
  onComplete?: Effect[];
}

export interface QuestDef {
  id: string;
  name: string;
  steps: QuestStepDef[];
}

export type DialogueLine =
  | { speaker: string | null; text: string; cue?: string }
  | { askName: true };

export interface DialogueDef {
  id: string;
  character: string;
  when?: Condition;
  lines: DialogueLine[];
  effects?: Effect[];
}

export interface Content {
  characters: Record<string, CharacterDef>;
  bodies: Record<string, BodyDef>;
  items: Record<string, ItemDef>;
  recipes: Record<string, RecipeDef>;
  maps: Record<string, MapDef>;
  quests: Record<string, QuestDef>;
  /** Pro Figur geordnet: der erste Dialog, dessen Bedingung passt, wird gespielt. */
  dialogues: DialogueDef[];
  start: { character: string; map: string };
}

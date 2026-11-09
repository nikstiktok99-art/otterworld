// Typen der Inhaltsdaten. Inhalte sind reine Daten: Figuren, Körper, Orte, Gegenstände, Rezepte, Quests, Dialoge.
import type { Dir, Tile } from '../game/types';

export type Terrain = 'water' | 'sand' | 'grass' | 'blumen' | 'boden' | 'steg' | 'pfad' | 'schilf' | 'zaun' | 'wand' | 'blocked';

/** Kleine sichtbare Eigenheit eines Körpers (z. B. Bubbles macht immer wieder Blasen). */
export type BodyTrait = 'blasen' | 'farbwechsel';
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
  | { hasMoment: string }
  /** Mindestens so viele Gegenstände im Beutel (z. B. „Bringst du mir drei Muscheln?“). */
  | { hasItems: Record<string, number> };

/** Wirkungen, z. B. am Ende eines Dialogs oder eines Questschritts. Sie werden über `claimed` genau einmal vergeben. */
export type Effect =
  | { startQuest: string }
  | { learnRecipe: string }
  | { addMoment: string }
  | { setDecoOn: { item: string; on: boolean } }
  | { unlockCharacter: string }
  /** Geschenk einer Figur. */
  | { giveItems: Record<string, number> }
  /** Abgeben (nur in Dialogen): fehlt etwas, wird das Gespräch nicht abgeschlossen und nichts vergeben. */
  | { takeItems: Record<string, number> };

export type Trigger =
  | { hasItems: Record<string, number> }
  | { crafted: string }
  | { placed: string }
  | { dialogue: string }
  /** Die Spielerin ist in dieser Map angekommen (oder schon dort). */
  | { atMap: string };

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
  /** Eintrag im Freundebuch, sobald man sich kennt. */
  friend?: { about: string; metWhen: Condition };
}

export interface BodyDef {
  id: string;
  /** Basis-Grafikschlüssel, z. B. 'characters.otter'. */
  sprite: string;
  moves: Movement[];
  /** Geschwindigkeit in Weltpixeln pro Sekunde. */
  speed: { land: number; water: number };
  seats?: number;
  traits?: BodyTrait[];
}

/** Ein gemeinsames Erlebnis mit einer Figur (Grundlage für Vertrauen und Freischaltungen). */
export interface MomentDef {
  id: string;
  character: string;
  title: string;
  text: string;
}

export interface ItemDef {
  id: string;
  name: string;
  plural: string;
  kind: 'material' | 'deco';
  /** Ein kurzer Satz für Beutel und Werkbank. */
  description?: string;
  /** Grafikschlüssel in der Welt (Fundstelle oder aufgestellte Deko). */
  sprite: string;
  deco?: {
    /** Grafikschlüssel für den eingeschalteten Zustand. */
    spriteOn?: string;
    /** Darf erst ein- und ausgeschaltet werden, wenn diese Bedingung gilt. */
    toggleWhen?: Condition;
    toggleNotYetText?: string;
    /** Lichtschein im eingeschalteten Zustand: Versatz zum Bodenpunkt und Größe (Standard: wie die Uferleuchte). */
    glow?: { x: number; y: number; scale: number };
  };
}

export interface RecipeDef {
  id: string;
  name: string;
  inputs: Record<string, number>;
  output: { item: string; count: number };
  /** Wo gebaut wird (Standard: 'werkbank'). Später z. B. ein Kochtopf im Hotpot-Restaurant. */
  station?: string;
}

/** Standard-Station für Rezepte ohne eigene Angabe. */
export const DEFAULT_STATION = 'werkbank';

export interface MapObjectDef {
  id: string;
  name: string;
  sprite: string;
  /** Linke obere Kachel der Grundfläche. */
  tile: Tile;
  footprint: { w: number; h: number };
  /** Grafik gespiegelt zeichnen (z. B. Wegweiser nach links). */
  flip?: boolean;
  /** Anderes Aussehen je nach Spielverlauf (erste passende Bedingung gilt), z. B. Stein mit Wimpel. */
  variants?: Array<{ when: Condition; sprite: string }>;
  interaction?:
    | { kind: 'workbench'; station?: string; title?: string }
    | { kind: 'inspect'; text: string }
    | { kind: 'exit'; exit: string };
}

export interface GatherSpotDef {
  id: string;
  item: string;
  count: number;
  tile: Tile;
  sprite: string;
  /** Erst sichtbar und sammelbar, wenn diese Bedingung gilt. */
  availableWhen?: Condition;
  /** Wächst nach so vielen Minuten (Echtzeit) nach. Fehlt die Angabe, gibt es die Fundstelle nur einmal. */
  regrowMinutes?: number;
}

export type PlacementTarget = { tile: Tile } | { besideDeco: string };

/**
 * Wo sich ein Weltkörper aufhält – über alle Maps hinweg. Pro Körper gibt es genau eine Begegnung,
 * und die erste passende Platzierung gilt. So steht jeder Körper höchstens einmal in der Welt.
 */
export interface EncounterDef {
  id: string;
  /** Figuren, die diesen Körper teilen (eine Figur oder z. B. das Erbsentrio). Die erste spricht. */
  characters: string[];
  placements: Array<{
    when?: Condition;
    map: string;
    at: PlacementTarget;
    pose: 'idle' | 'sit';
    facing: Dir;
    /** Nach dem Hinlaufen von selbst das Gespräch beginnen, solange diese Bedingung gilt. */
    talkOnArrival?: Condition;
  }>;
}

/** Ein Ausgang: Wer auf eine dieser Kacheln geht (als Tippziel), wechselt den Ort. */
export interface ExitDef {
  id: string;
  /** Kurzer Name des Ziels, z. B. „Schilfbucht“. */
  label: string;
  tiles: Tile[];
  to: { map: string; entry: string };
  /** Akkusativ für „Hier würde sie ___ versperren.“ */
  keepName: string;
}

/** Ankunftspunkt nach einem Ortswechsel. */
export interface EntryDef {
  id: string;
  tile: Tile;
  facing: Dir;
}

export interface MapDef {
  id: string;
  name: string;
  /** „am Startufer“, „in der Schilfbucht“ – für Texte wie „steht am Startufer“. */
  at: string;
  /** Eine Zeile pro Kachelreihe, ein Zeichen pro Kachel. */
  grid: string[];
  legend: Record<string, Terrain>;
  /** Sicherer Platz, falls eine gespeicherte Position nicht mehr passt. */
  arrival: Tile;
  objects: MapObjectDef[];
  gatherSpots: GatherSpotDef[];
  exits: ExitDef[];
  entries: EntryDef[];
  /** Fläche, auf der Deko stehen darf. Fehlt sie, lässt sich hier nichts aufstellen. */
  decorZone?: { x: number; y: number; w: number; h: number };
  /** Diese Kacheln müssen zu Fuß erreichbar bleiben (z. B. der Steg). Ausgänge gelten automatisch. */
  keepReachable: Array<{ tile: Tile; name: string }>;
  ambience?: string;
  /** Farbe außerhalb der Karte (sichtbar am Rand, z. B. über der obersten Reihe). Standard: Wasserblau. */
  backdrop?: string;
  /** Platz auf der Wegkarte in Prozent (0–100). Fehlt er, erscheint der Ort nicht auf der Karte. */
  overview?: { x: number; y: number };
}

export interface QuestStepDef {
  id: string;
  /** Kurzer Hinweis in der Anzeige oben. Platzhalter: {count:item.x}, {name}. */
  hint: string;
  completeWhen: Trigger;
  onComplete?: Effect[];
}

export interface QuestDef {
  id: string;
  name: string;
  /** Wer die Aufgabe gibt (Figuren-ID) – für Aufgabenbuch und Freundebuch. */
  giver?: string;
  /** Hinweis, solange die Quest noch nicht begonnen hat, aber schon ansteht. */
  offer?: { when: Condition; hint: string };
  steps: QuestStepDef[];
  /** Abschlusskarte. */
  ending?: { title: string; text: string };
}

/**
 * Antwortmöglichkeit der Spielerin. 'weiter' führt das Gespräch fort; 'spaeter' beendet es ohne Folgen –
 * beim nächsten Ansprechen kommt dasselbe Gespräch noch einmal (z. B. eine Aufgabe erst später annehmen).
 */
export interface DialogueChoice {
  label: string;
  then: 'weiter' | 'spaeter';
}

export type DialogueLine =
  | { speaker: string | null; text: string; cue?: string; choices?: DialogueChoice[] }
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
  encounters: EncounterDef[];
  quests: Record<string, QuestDef>;
  moments: Record<string, MomentDef>;
  /** Pro Figur geordnet: der erste Dialog, dessen Bedingung passt, wird gespielt. */
  dialogues: DialogueDef[];
  start: { character: string; map: string };
}

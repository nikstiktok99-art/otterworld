import type { Dir, Tile } from './types';

/** Alle Spielaktionen. Welt und UI rufen genau diese auf – es gibt keine zweite Stelle, die Zustand ändert. */
export type Action =
  | { type: 'gather'; map: string; spot: string }
  | { type: 'craft'; recipe: string }
  | { type: 'placeDeco'; item: string; map: string; tile: Tile }
  | { type: 'moveDeco'; uid: string; tile: Tile }
  | { type: 'toggleDeco'; uid: string }
  | { type: 'finishDialogue'; dialogue: string }
  | { type: 'setPlayerName'; name: string }
  | { type: 'arrive'; map: string; tile: Tile; facing: Dir }
  | { type: 'travel'; exit: string }
  | { type: 'switchCharacter'; character: string }
  | { type: 'setSetting'; key: 'sound' | 'haptics'; value: boolean };

export type RejectReason =
  | 'unknown'
  | 'alreadyGathered'
  | 'recipeUnknown'
  | 'missingItems'
  | 'notInInventory'
  | 'notPlaceable'
  | 'outsideZone'
  | 'occupied'
  | 'blocksPath'
  | 'notYet'
  | 'invalidName'
  | 'invalidPosition'
  | 'locked';

export type GameEvent =
  | { type: 'itemGained'; item: string; count: number; total: number }
  | { type: 'itemsUsed'; items: Record<string, number> }
  | { type: 'crafted'; recipe: string; item: string }
  | { type: 'placed'; uid: string; item: string; tile: Tile }
  | { type: 'moved'; uid: string; tile: Tile }
  | { type: 'toggled'; uid: string; on: boolean }
  | { type: 'dialogueFinished'; dialogue: string }
  | { type: 'recipeLearned'; recipe: string }
  | { type: 'questStarted'; quest: string }
  | { type: 'questStep'; quest: string; step: string }
  | { type: 'questDone'; quest: string }
  | { type: 'momentGained'; moment: string }
  | { type: 'nameSet'; name: string }
  | { type: 'traveled'; exit: string; from: string; to: string }
  | { type: 'switched'; character: string; body: string; bodyChanged: boolean }
  | { type: 'unlocked'; character: string }
  | { type: 'rejected'; action: Action['type']; reason: RejectReason; detail?: string };

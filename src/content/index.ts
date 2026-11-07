import type { Content } from './types';
import { bodies, characters } from './characters';
import { items, recipes } from './items';
import { quests } from './quests';
import { dialogues } from './dialogues';
import { startufer } from './maps/startufer';
import { MAP_STARTUFER } from './ids';

// Zentrale Sammlung aller Inhaltspakete. Eine neue Map kommt als weiterer Eintrag in `maps` hinzu.
export const content: Content = {
  characters,
  bodies,
  items,
  recipes,
  maps: { [startufer.id]: startufer },
  quests,
  dialogues,
  start: { character: 'otter', map: MAP_STARTUFER },
};

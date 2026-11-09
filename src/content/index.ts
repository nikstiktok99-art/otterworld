import type { Content } from './types';
import { bodies, characters } from './characters';
import { items, recipes } from './items';
import { moments, quests } from './quests';
import { dialogues } from './dialogues';
import { encounters } from './encounters';
import { startufer } from './maps/startufer';
import { schilfbucht } from './maps/schilfbucht';
import { tiramisuStream } from './maps/tiramisu-stream';
import { zoo } from './maps/zoo';
import { MAP_STARTUFER } from './ids';

// Zentrale Sammlung aller Inhaltspakete. Eine neue Map kommt als weiterer Eintrag in `maps` hinzu
// (plus Ausgänge hin und zurück und ggf. Platzierungen in `encounters`).
export const content: Content = {
  characters,
  bodies,
  items,
  recipes,
  maps: { [startufer.id]: startufer, [schilfbucht.id]: schilfbucht, [tiramisuStream.id]: tiramisuStream, [zoo.id]: zoo },
  encounters,
  quests,
  moments,
  dialogues,
  start: { character: 'otter', map: MAP_STARTUFER },
};

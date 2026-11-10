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
import { catCafe } from './maps/cat-cafe';
import { hotpotRestaurant } from './maps/hotpot-restaurant';
import { fuchsbau } from './maps/fuchsbau';
import { MAP_STARTUFER } from './ids';
import { vertrauenDialogues, vertrauenItems, vertrauenMoments, vertrauenQuests, vertrauenRecipes } from './vertrauen';

// Zentrale Sammlung aller Inhaltspakete. Eine neue Map kommt als weiterer Eintrag in `maps` hinzu
// (plus Ausgänge hin und zurück und ggf. Platzierungen in `encounters`).
export const content: Content = {
  characters,
  bodies,
  items: { ...items, ...vertrauenItems },
  recipes: { ...recipes, ...vertrauenRecipes },
  maps: {
    [startufer.id]: startufer,
    [schilfbucht.id]: schilfbucht,
    [tiramisuStream.id]: tiramisuStream,
    [zoo.id]: zoo,
    [catCafe.id]: catCafe,
    [hotpotRestaurant.id]: hotpotRestaurant,
    [fuchsbau.id]: fuchsbau,
  },
  encounters,
  quests: { ...quests, ...vertrauenQuests },
  moments: { ...moments, ...vertrauenMoments },
  // Vertrauens-Gespräche zuerst: Sie greifen erst nach der ersten Aufgabe eines Freundes und gehen dann vor.
  dialogues: [...vertrauenDialogues, ...dialogues],
  start: { character: 'otter', map: MAP_STARTUFER },
};

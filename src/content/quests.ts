import type { QuestDef } from './types';
import { M_ERSTER_ABEND, Q_LICHT, R_LEUCHTE } from './ids';

// Vorschlag aus dem Startplan: Am Steg fehlt abends ein Licht. Austauschbar.
export const quests: Record<string, QuestDef> = {
  [Q_LICHT]: {
    id: Q_LICHT,
    name: 'Ein Licht am Steg',
    steps: [
      {
        id: 'sammeln',
        hint: 'Uferleuchte: Treibholz {count:item.treibholz}/2 · Muschelschale {count:item.muschelschale}/1',
        completeWhen: { hasItems: { 'item.treibholz': 2, 'item.muschelschale': 1 } },
      },
      {
        id: 'bauen',
        hint: 'Alles beisammen – zur Werkbank neben deinem Bau',
        completeWhen: { crafted: R_LEUCHTE },
      },
      {
        id: 'aufstellen',
        hint: 'Uferleuchte aufstellen – im Beutel',
        completeWhen: { placed: 'item.uferleuchte' },
      },
      {
        id: 'abend',
        hint: 'Schnabbi wartet an der Leuchte',
        completeWhen: { dialogue: 'dlg.schnabbi.abschluss' },
        onComplete: [
          { setDecoOn: { item: 'item.uferleuchte', on: true } },
          { addMoment: M_ERSTER_ABEND },
        ],
      },
    ],
  },
};

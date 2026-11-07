import type { ItemDef, RecipeDef } from './types';
import { Q_LICHT } from './ids';

export const items: Record<string, ItemDef> = {
  'item.treibholz': {
    id: 'item.treibholz',
    name: 'Treibholz',
    plural: 'Treibholz',
    kind: 'material',
    sprite: 'items.treibholz',
  },
  'item.muschelschale': {
    id: 'item.muschelschale',
    name: 'Muschelschale',
    plural: 'Muschelschalen',
    kind: 'material',
    sprite: 'items.muschelschale',
  },
  'item.uferleuchte': {
    id: 'item.uferleuchte',
    name: 'Uferleuchte',
    plural: 'Uferleuchten',
    kind: 'deco',
    sprite: 'deco.uferleuchte.aus',
    deco: {
      spriteOn: 'deco.uferleuchte.an',
      toggleWhen: { questDone: Q_LICHT },
      toggleNotYetText: 'Die Leuchte ist noch aus. Vielleicht weiß Schnabbi, wie sie angeht.',
    },
  },
};

export const recipes: Record<string, RecipeDef> = {
  'recipe.uferleuchte': {
    id: 'recipe.uferleuchte',
    name: 'Uferleuchte',
    inputs: { 'item.treibholz': 2, 'item.muschelschale': 1 },
    output: { item: 'item.uferleuchte', count: 1 },
  },
};

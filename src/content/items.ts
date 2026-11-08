import type { ItemDef, RecipeDef } from './types';
import { Q_LICHT, R_LEUCHTE, R_MATTE } from './ids';

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
  // Phase 2 (Vorschlag)
  'item.schilfhalm': {
    id: 'item.schilfhalm',
    name: 'Schilfhalm',
    plural: 'Schilfhalme',
    kind: 'material',
    sprite: 'items.schilfhalm',
  },
  'item.schilfmatte': {
    id: 'item.schilfmatte',
    name: 'Schilfmatte',
    plural: 'Schilfmatten',
    kind: 'deco',
    sprite: 'deco.schilfmatte',
  },
};

export const recipes: Record<string, RecipeDef> = {
  [R_LEUCHTE]: {
    id: R_LEUCHTE,
    name: 'Uferleuchte',
    inputs: { 'item.treibholz': 2, 'item.muschelschale': 1 },
    output: { item: 'item.uferleuchte', count: 1 },
  },
  [R_MATTE]: {
    id: R_MATTE,
    name: 'Schilfmatte',
    inputs: { 'item.schilfhalm': 3 },
    output: { item: 'item.schilfmatte', count: 1 },
  },
};

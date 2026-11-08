import type { ItemDef, RecipeDef } from './types';
import { Q_LICHT, R_BANK, R_LEUCHTE, R_MATTE, R_WINDSPIEL } from './ids';

// ENTWURF: Namen und Beschreibungen sind Vorschläge.
export const items: Record<string, ItemDef> = {
  'item.treibholz': {
    id: 'item.treibholz',
    name: 'Treibholz',
    plural: 'Treibholz',
    kind: 'material',
    description: 'Vom Wasser glatt geschliffen. Am Ufer wird immer wieder neues angespült.',
    sprite: 'items.treibholz',
  },
  'item.muschelschale': {
    id: 'item.muschelschale',
    name: 'Muschelschale',
    plural: 'Muschelschalen',
    kind: 'material',
    description: 'Zartrosa und ein bisschen glänzend.',
    sprite: 'items.muschelschale',
  },
  'item.uferleuchte': {
    id: 'item.uferleuchte',
    name: 'Uferleuchte',
    plural: 'Uferleuchten',
    kind: 'deco',
    description: 'Ein Pfosten aus Treibholz mit einer Muschel als Lampe.',
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
    description: 'Lang, weich und biegsam – gut zum Flechten.',
    sprite: 'items.schilfhalm',
  },
  'item.schilfmatte': {
    id: 'item.schilfmatte',
    name: 'Schilfmatte',
    plural: 'Schilfmatten',
    kind: 'deco',
    description: 'Geflochten aus Schilf aus der Bucht. Darauf sitzt es sich abends warm.',
    sprite: 'deco.schilfmatte',
  },
  // Freies Bauen nach Phase 2 (Vorschlag)
  'item.treibholzbank': {
    id: 'item.treibholzbank',
    name: 'Treibholzbank',
    plural: 'Treibholzbänke',
    kind: 'deco',
    description: 'Eine kleine Bank zum Ausruhen.',
    sprite: 'deco.treibholzbank',
  },
  'item.muschelwindspiel': {
    id: 'item.muschelwindspiel',
    name: 'Muschelwindspiel',
    plural: 'Muschelwindspiele',
    kind: 'deco',
    description: 'Klimpert leise, wenn Wind vom Wasser kommt.',
    sprite: 'deco.muschelwindspiel',
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
  [R_BANK]: {
    id: R_BANK,
    name: 'Treibholzbank',
    inputs: { 'item.treibholz': 3 },
    output: { item: 'item.treibholzbank', count: 1 },
  },
  [R_WINDSPIEL]: {
    id: R_WINDSPIEL,
    name: 'Muschelwindspiel',
    inputs: { 'item.treibholz': 1, 'item.muschelschale': 2 },
    output: { item: 'item.muschelwindspiel', count: 1 },
  },
};

import type { ItemDef, RecipeDef } from './types';
import { Q_LICHT, R_BANK, R_GIRLANDE, R_KIESELLICHT, R_KISSEN, R_LEUCHTE, R_MATTE, R_WINDSPIEL } from './ids';

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
  // Kapitel Tiramisu Stream (Vorschlag)
  'item.wiesenbluete': {
    id: 'item.wiesenbluete',
    name: 'Wiesenblüte',
    plural: 'Wiesenblüten',
    kind: 'material',
    description: 'Klein, bunt und duftet nach Sommer.',
    sprite: 'items.wiesenbluete',
  },
  'item.glitzerkiesel': {
    id: 'item.glitzerkiesel',
    name: 'Glitzerkiesel',
    plural: 'Glitzerkiesel',
    kind: 'material',
    description: 'Ein runder Kiesel, der im Licht funkelt.',
    sprite: 'items.glitzerkiesel',
  },
  'item.seerosenblatt': {
    id: 'item.seerosenblatt',
    name: 'Seerosenblatt',
    plural: 'Seerosenblätter',
    kind: 'material',
    description: 'Groß, rund und ganz glatt. Schwimmt oben auf dem Teich.',
    sprite: 'items.seerosenblatt',
  },
  'item.bluetengirlande': {
    id: 'item.bluetengirlande',
    name: 'Blütengirlande',
    plural: 'Blütengirlanden',
    kind: 'deco',
    description: 'Wiesenblüten an einer Schnur, mit einem Glitzerkiesel in der Mitte.',
    sprite: 'deco.bluetengirlande',
  },
  'item.seerosenkissen': {
    id: 'item.seerosenkissen',
    name: 'Seerosenkissen',
    plural: 'Seerosenkissen',
    kind: 'deco',
    description: 'Weich gepolstert mit Seerosenblättern.',
    sprite: 'deco.seerosenkissen',
  },
  'item.kiesellicht': {
    id: 'item.kiesellicht',
    name: 'Kiesellicht',
    plural: 'Kiesellichter',
    kind: 'deco',
    description: 'Glitzerkiesel in einer Muschel. Antippen schaltet das sanfte Licht an und aus.',
    sprite: 'deco.kiesellicht.aus',
    deco: { spriteOn: 'deco.kiesellicht.an', glow: { x: 0, y: -6, scale: 0.9 } },
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
  [R_GIRLANDE]: {
    id: R_GIRLANDE,
    name: 'Blütengirlande',
    inputs: { 'item.wiesenbluete': 3, 'item.glitzerkiesel': 1 },
    output: { item: 'item.bluetengirlande', count: 1 },
  },
  [R_KISSEN]: {
    id: R_KISSEN,
    name: 'Seerosenkissen',
    inputs: { 'item.seerosenblatt': 2, 'item.wiesenbluete': 1 },
    output: { item: 'item.seerosenkissen', count: 1 },
  },
  [R_KIESELLICHT]: {
    id: R_KIESELLICHT,
    name: 'Kiesellicht',
    inputs: { 'item.glitzerkiesel': 2, 'item.muschelschale': 1 },
    output: { item: 'item.kiesellicht', count: 1 },
  },
};

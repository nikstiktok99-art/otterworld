import type { MapDef } from '../types';
import { MAP_CAFE, MAP_ZOO, NACHWACHSEN_MIN } from '../ids';

// Cat Café (Ort aus dem Masterprompt; Gestaltung offen, Bild macht Codex).
// Vorschlag: ein gemütlicher Innenraum mit Theke, Basteltisch, kleinen Tischen, schlafenden Katzen und großen
// Pflanzen, zwischen denen sich Chamaron versteckt. Tür unten führt in den Zoo. 16 × 30 Kacheln.
// Legende: W Wand · . Holzboden
const grid = [
  'WWWWWWWWWWWWWWWW', //  0
  'WWWWWWWWWWWWWWWW', //  1  Fenster
  'W..............W', //  2  Teepflanzen
  'W..............W', //  3
  'W..............W', //  4  Theke, Basteltisch
  'W..............W', //  5
  'W..............W', //  6
  'W..............W', //  7
  'W..............W', //  8  Katze
  'W..............W', //  9
  'W..............W', // 10
  'W..............W', // 11  Tische
  'W..............W', // 12
  'W..............W', // 13  große Pflanze, Chamaron
  'W..............W', // 14
  'W..............W', // 15
  'W..............W', // 16
  'W..............W', // 17
  'W..............W', // 18  Tische
  'W..............W', // 19
  'W..............W', // 20
  'W..............W', // 21
  'W..............W', // 22  Katze
  'W..............W', // 23
  'W..............W', // 24
  'W..............W', // 25
  'W..............W', // 26
  'W..............W', // 27
  'W..............W', // 28
  'WWWWWWW..WWWWWWW', // 29  Tür zum Zoo
];

export const catCafe: MapDef = {
  id: MAP_CAFE,
  name: 'Cat Café',
  at: 'im Cat Café',
  grid,
  legend: { W: 'wand', '.': 'boden' },
  arrival: { x: 8, y: 27 },
  objects: [
    {
      id: 'obj.theke',
      name: 'Theke',
      sprite: 'objects.theke',
      tile: { x: 2, y: 4 },
      footprint: { w: 5, h: 1 },
      interaction: { kind: 'inspect', text: 'Die Theke des Cat Cafés. Es duftet nach Tee und frischem Gebäck.' },
    },
    {
      id: 'obj.basteltisch',
      name: 'Basteltisch',
      sprite: 'objects.basteltisch',
      tile: { x: 11, y: 4 },
      footprint: { w: 2, h: 1 },
      interaction: { kind: 'workbench', title: 'Basteltisch' },
    },
    ...[
      { x: 3, y: 11 },
      { x: 10, y: 11 },
      { x: 3, y: 18 },
      { x: 10, y: 18 },
    ].map((tile, i) => ({
      id: `obj.cafetisch.${i + 1}`,
      name: 'Tisch',
      sprite: 'objects.cafetisch',
      tile,
      footprint: { w: 2, h: 1 },
      interaction: { kind: 'inspect' as const, text: 'Ein kleiner runder Tisch mit einer Tasse Tee.' },
    })),
    {
      id: 'obj.katze.grau',
      name: 'Katze',
      sprite: 'objects.katze.grau',
      tile: { x: 6, y: 8 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'inspect', text: 'Eine graue Katze schläft zusammengerollt. Sie schnurrt leise.' },
    },
    {
      id: 'obj.katze.rot',
      name: 'Katze',
      sprite: 'objects.katze.rot',
      tile: { x: 12, y: 22 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'inspect', text: 'Eine rote Katze blinzelt dich verschlafen an und kuschelt sich wieder ein.' },
    },
    {
      id: 'obj.pflanze.gross',
      name: 'Große Pflanze',
      sprite: 'objects.zimmerpflanze',
      tile: { x: 14, y: 13 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'inspect', text: 'Eine große Zimmerpflanze. Die Blätter wackeln ein bisschen.' },
    },
    {
      id: 'obj.pflanze.ecke',
      name: 'Pflanze',
      sprite: 'objects.zimmerpflanze',
      tile: { x: 1, y: 24 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'inspect', text: 'Eine Zimmerpflanze in einem bunten Topf.' },
    },
  ],
  gatherSpots: [
    { id: 'spot.tee.links', item: 'item.teeblatt', count: 1, tile: { x: 2, y: 2 }, sprite: 'items.teepflanze', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.tee.rechts', item: 'item.teeblatt', count: 1, tile: { x: 13, y: 2 }, sprite: 'items.teepflanze', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.tee.mitte', item: 'item.teeblatt', count: 1, tile: { x: 1, y: 15 }, sprite: 'items.teepflanze', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.wolle.oben', item: 'item.wollfaden', count: 1, tile: { x: 7, y: 9 }, sprite: 'items.wollfaden', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.wolle.unten', item: 'item.wollfaden', count: 1, tile: { x: 11, y: 23 }, sprite: 'items.wollfaden', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.wolle.ecke', item: 'item.wollfaden', count: 1, tile: { x: 5, y: 26 }, sprite: 'items.wollfaden', regrowMinutes: NACHWACHSEN_MIN },
  ],
  exits: [
    {
      id: 'exit.zum-zoo',
      label: 'Zoo',
      tiles: [
        { x: 7, y: 29 },
        { x: 8, y: 29 },
      ],
      to: { map: MAP_ZOO, entry: 'entry.vom-cafe' },
      keepName: 'die Tür',
    },
  ],
  entries: [{ id: 'entry.vom-zoo', tile: { x: 7, y: 28 }, facing: 'ne' }],
  decorZone: { x: 1, y: 2, w: 14, h: 27 },
  keepReachable: [
    { tile: { x: 11, y: 5 }, name: 'den Basteltisch' },
    { tile: { x: 4, y: 5 }, name: 'die Theke' },
  ],
  ambience: 'ambience.cat-cafe',
  overview: { x: 28, y: 89 },
  backdrop: '#6e4a32',
};

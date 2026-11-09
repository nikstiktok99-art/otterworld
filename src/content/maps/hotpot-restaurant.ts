import type { MapDef } from '../types';
import { MAP_HOTPOT, MAP_ZOO, NACHWACHSEN_MIN, STATION_KOCHTOPF } from '../ids';

// Hotpot-Restaurant (Ort aus dem Masterprompt; Gestaltung offen, Bild macht Codex).
// Vorschlag: oben die Küche mit dem großen Kochtopf (eigene Station), Mehl, Möhrchen und Kräutern; darunter die Theke,
// an der die Erbsen in ihrer Schale sitzen, und runde Tische mit kleinen Töpfen. Tür unten führt in den Zoo.
// Legende: W Wand · . Holzboden
const grid = [
  'WWWWWWWWWWWWWWWW', //  0
  'WWWWWWWWWWWWWWWW', //  1
  'W..............W', //  2
  'W..............W', //  3  Gemüse, Kochtopf, Mehl
  'W..............W', //  4
  'W..............W', //  5
  'W..............W', //  6
  'W..............W', //  7  Theke, Kräuter
  'W..............W', //  8  Erbsen
  'W..............W', //  9
  'W..............W', // 10  Laternen
  'W..............W', // 11
  'W..............W', // 12
  'W..............W', // 13
  'W..............W', // 14  Tische
  'W..............W', // 15
  'W..............W', // 16
  'W..............W', // 17
  'W..............W', // 18
  'W..............W', // 19
  'W..............W', // 20
  'W..............W', // 21  Tische
  'W..............W', // 22
  'W..............W', // 23
  'W..............W', // 24
  'W..............W', // 25
  'W..............W', // 26
  'W..............W', // 27
  'W..............W', // 28
  'WWWWWWW..WWWWWWW', // 29  Tür zum Zoo
];

export const hotpotRestaurant: MapDef = {
  id: MAP_HOTPOT,
  name: 'Hotpot-Restaurant',
  at: 'im Hotpot-Restaurant',
  grid,
  legend: { W: 'wand', '.': 'boden' },
  arrival: { x: 8, y: 27 },
  objects: [
    {
      id: 'obj.kochtopf',
      name: 'Kochtopf',
      sprite: 'objects.kochtopf',
      tile: { x: 7, y: 3 },
      footprint: { w: 2, h: 2 },
      interaction: { kind: 'workbench', station: STATION_KOCHTOPF, title: 'Kochtopf' },
    },
    {
      id: 'obj.theke.hotpot',
      name: 'Theke',
      sprite: 'objects.theke',
      tile: { x: 2, y: 7 },
      footprint: { w: 5, h: 1 },
      interaction: { kind: 'inspect', text: 'Die Theke des Hotpot-Restaurants. Hier warten Schälchen und Stäbchen.' },
    },
    ...[
      { x: 3, y: 14 },
      { x: 10, y: 14 },
      { x: 3, y: 21 },
      { x: 10, y: 21 },
    ].map((tile, i) => ({
      id: `obj.hotpottisch.${i + 1}`,
      name: 'Tisch',
      sprite: 'objects.hotpottisch',
      tile,
      footprint: { w: 2, h: 2 },
      interaction: { kind: 'inspect' as const, text: 'Ein runder Tisch mit einem kleinen Topf in der Mitte. Es duftet nach Brühe.' },
    })),
    ...[
      { x: 1, y: 10 },
      { x: 14, y: 10 },
    ].map((tile, i) => ({
      id: `obj.laterne.${i + 1}`,
      name: 'Laterne',
      sprite: 'objects.laterne',
      tile,
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'inspect' as const, text: 'Eine rote Papierlaterne. Sie leuchtet warm.' },
    })),
  ],
  gatherSpots: [
    { id: 'spot.gemuese.links', item: 'item.moehrchen', count: 1, tile: { x: 2, y: 3 }, sprite: 'items.gemuesekiste', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.gemuese.mitte', item: 'item.moehrchen', count: 1, tile: { x: 4, y: 3 }, sprite: 'items.gemuesekiste', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.mehl.links', item: 'item.mehl', count: 1, tile: { x: 11, y: 3 }, sprite: 'items.mehlsack', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.mehl.rechts', item: 'item.mehl', count: 1, tile: { x: 13, y: 3 }, sprite: 'items.mehlsack', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.kraeuter', item: 'item.kraeuter', count: 1, tile: { x: 13, y: 7 }, sprite: 'items.kraeutertopf', regrowMinutes: NACHWACHSEN_MIN },
  ],
  exits: [
    {
      id: 'exit.zum-zoo',
      label: 'Zoo',
      tiles: [
        { x: 7, y: 29 },
        { x: 8, y: 29 },
      ],
      to: { map: MAP_ZOO, entry: 'entry.vom-hotpot' },
      keepName: 'die Tür',
    },
  ],
  entries: [{ id: 'entry.vom-zoo', tile: { x: 7, y: 28 }, facing: 'ne' }],
  decorZone: { x: 1, y: 9, w: 14, h: 20 },
  keepReachable: [
    { tile: { x: 7, y: 5 }, name: 'den Kochtopf' },
    { tile: { x: 7, y: 8 }, name: 'die Theke' },
  ],
  ambience: 'ambience.hotpot',
  overview: { x: 74, y: 89 },
  backdrop: '#5a2e22',
};

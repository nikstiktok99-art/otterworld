import type { MapDef } from '../types';
import { MAP_SCHILFBUCHT, MAP_STARTUFER } from '../ids';

// Vorläufiges Startufer (Vorschlag aus dem Startplan). 16 × 32 Kacheln à 16 px.
// Legende: ~ Wasser · : Sand · , Gras · = Steg · - Pfad · # Büsche/Wurzeln (nicht begehbar)
const grid = [
  '~~~~~~~~~~~~~~~~', //  0
  '~~~~~~~~~~~~~~~~', //  1
  '~~~~~~~~~~~~~~~~', //  2
  '~~~~~~~~~~~~~~~~', //  3
  '~~~~~~~~~~~~~~~~', //  4
  '~~~~~~~~~~~~~~~~', //  5
  '~~~~~~~~~~~~~~~~', //  6
  '~~~~~~~~~~~~~~~~', //  7
  '~~~~~~~~~~=~~~~~', //  8  Stegende
  '~~~~~~~~~~=~~~~~', //  9
  '~~~~~~~~~~=~~~~~', // 10
  '~~~~~~~~~~=~~~~~', // 11
  '~~~~~~~~~~=~~~~~', // 12
  '#~~~~~~~~~=~~~~#', // 13
  '##~~~~~~~~=~~~##', // 14
  '#:::~~~~~~=~~::#', // 15  Stegansatz
  '#::::::::::::::#', // 16
  '#::::::::::::::#', // 17
  '#::::::::::::::#', // 18
  '#,::::::::::::,#', // 19
  '#,,,::::::::,,,#', // 20  Wegweiser
  '#,,,,,,,,,,,,,--', // 21  Pfad zur Schilfbucht
  '#,,,,,,,,,,,,,--', // 22
  '#,,,,,,,,,,,,,,#', // 23  Bau
  '#,,,,,,,,,,,,,,#', // 24  Bau, Werkbank
  '#,,,,,,,,,,,,,,#', // 25  vor dem Bau
  '#,,,,,,,,,,,,,,#', // 26
  '#,,,,,,,,,,,,,,#', // 27
  '#,,,,,,,,,,,,,,#', // 28
  '#,,,,,,,,,,,,,,#', // 29
  '#,,,,,,,,,,,,,,#', // 30
  '################', // 31
];

export const startufer: MapDef = {
  id: MAP_STARTUFER,
  name: 'Startufer',
  at: 'am Startufer',
  grid,
  legend: { '~': 'water', ':': 'sand', ',': 'grass', '=': 'steg', '-': 'pfad', '#': 'blocked' },
  arrival: { x: 3, y: 26 },
  objects: [
    {
      id: 'obj.bau',
      name: 'Dein Bau',
      sprite: 'objects.bau',
      tile: { x: 2, y: 23 },
      footprint: { w: 3, h: 2 },
      interaction: { kind: 'inspect', text: 'Dein Bau. Drinnen ist es warm und trocken.' },
    },
    {
      id: 'obj.werkbank',
      name: 'Werkbank',
      sprite: 'objects.werkbank',
      tile: { x: 11, y: 24 },
      footprint: { w: 2, h: 1 },
      interaction: { kind: 'workbench' },
    },
    {
      id: 'obj.wegweiser.bucht',
      name: 'Wegweiser',
      sprite: 'objects.wegweiser',
      tile: { x: 14, y: 20 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'exit', exit: 'exit.zur-bucht' },
    },
  ],
  gatherSpots: [
    { id: 'spot.treibholz.strand', item: 'item.treibholz', count: 1, tile: { x: 4, y: 17 }, sprite: 'items.treibholz' },
    { id: 'spot.treibholz.wasser', item: 'item.treibholz', count: 1, tile: { x: 6, y: 11 }, sprite: 'items.treibholz.treibend' },
    { id: 'spot.muschel.sand', item: 'item.muschelschale', count: 1, tile: { x: 13, y: 18 }, sprite: 'items.muschelschale' },
  ],
  exits: [
    {
      id: 'exit.zur-bucht',
      label: 'Schilfbucht',
      tiles: [
        { x: 14, y: 21 },
        { x: 15, y: 21 },
        { x: 14, y: 22 },
        { x: 15, y: 22 },
      ],
      to: { map: MAP_SCHILFBUCHT, entry: 'entry.vom-ufer' },
      keepName: 'den Weg zur Schilfbucht',
    },
  ],
  entries: [{ id: 'entry.von-der-bucht', tile: { x: 13, y: 22 }, facing: 'sw' }],
  decorZone: { x: 1, y: 15, w: 14, h: 16 },
  keepReachable: [
    // name im Akkusativ: „Hier würde sie ___ versperren.“
    { tile: { x: 10, y: 15 }, name: 'den Steg' },
    { tile: { x: 11, y: 25 }, name: 'die Werkbank' },
    { tile: { x: 3, y: 25 }, name: 'deinen Bau' },
  ],
  ambience: 'ambience.startufer.abend',
};

import type { MapDef } from '../types';
import { MAP_STARTUFER, MAP_TIRAMISU, NACHWACHSEN_MIN } from '../ids';

// Tiramisu Stream (Eigenname aus dem Masterprompt; Gestaltung offen, Bild macht Codex).
// Vorschlag für den Aufbau: ein Bach mit Teich oben links (Rosie und Bubbles), zwei kleinen Brücken und einer
// Blumenwiese rechts mit Lumis Picknickplatz. 16 × 32 Kacheln.
// Legende: ~ Wasser · : Sand/Kies · , Gras · * Blumenwiese · = Brücke · - Pfad · # Büsche (nicht begehbar)
const grid = [
  '#####~~~~#######', //  0
  '#,,,,~~~~,,*,,,#', //  1
  '#,*,:~~~~:,,,,,#', //  2  Blüte hinter dem Teich (nur schwimmend)
  '#,,::~~~~:,,*,,#', //  3
  '#~~~~~~~~:,,,,,#', //  4  Teich
  '#~~~~~~~~:,,,,,#', //  5
  '#~~~~~~~~:,*,,,#', //  6
  '#~~~~~~~~:,,,,,#', //  7
  '#:~~~~~~~:,,,,,#', //  8
  '#,::~~~~~:,,*,,#', //  9
  '#,,,:~~~~:,,,,,#', // 10
  '#,*,:~~~~:,,,,,#', // 11
  '#,,,:~~~~:,,,,,#', // 12
  '#,,,,====,,,,,,#', // 13  Brücke
  '#,*,:~~~~:,,,,,#', // 14
  '#,,,:~~~~:,*,,,#', // 15  Picknickdecke
  '#,,,:~~~~:,,,,,#', // 16
  '#,,,,:~~~~:,,,,#', // 17  Lumi
  '#,*,,:~~~~:,,,,#', // 18
  '#,,,,:~~~~:,*,,#', // 19
  '#,,,:~~~~:,,,,,#', // 20
  '#,,,:~~~~:,,,,,#', // 21  Bastelstumpf
  '#,*,:~~~~:,,*,,#', // 22
  '#,,,,====,,,,,,#', // 23  Brücke
  '#,,,:~~~~:,,,,,#', // 24
  '#,*,:~~~~:,,,,,#', // 25
  '#,,,:~~~~:,,,,,#', // 26  Wegweiser
  '#,,,:~~~~:,,,,--', // 27  Pfad zum Startufer
  '#,,,:~~~~:,,,,--', // 28
  '#,,,:~~~~:,,*,,#', // 29
  '#,,,:~~~~:,,,,,#', // 30
  '####:~~~~:######', // 31
];

export const tiramisuStream: MapDef = {
  id: MAP_TIRAMISU,
  name: 'Tiramisu Stream',
  at: 'am Tiramisu Stream',
  grid,
  legend: { '~': 'water', ':': 'sand', ',': 'grass', '*': 'blumen', '=': 'steg', '-': 'pfad', '#': 'blocked' },
  arrival: { x: 12, y: 28 },
  objects: [
    {
      id: 'obj.picknickdecke',
      name: 'Picknickdecke',
      sprite: 'objects.picknickdecke',
      tile: { x: 11, y: 15 },
      footprint: { w: 3, h: 2 },
      interaction: { kind: 'inspect', text: 'Lumis Picknickdecke, kariert und weich.' },
    },
    {
      id: 'obj.bastelstumpf',
      name: 'Bastelstumpf',
      sprite: 'objects.bastelstumpf',
      tile: { x: 11, y: 21 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'workbench', title: 'Bastelstumpf' },
    },
    {
      id: 'obj.wegweiser.ufer',
      name: 'Wegweiser',
      sprite: 'objects.wegweiser',
      tile: { x: 14, y: 26 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'exit', exit: 'exit.zum-ufer' },
    },
  ],
  gatherSpots: [
    { id: 'spot.bluete.oben', item: 'item.wiesenbluete', count: 1, tile: { x: 2, y: 2 }, sprite: 'items.wiesenbluete', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.bluete.wiese', item: 'item.wiesenbluete', count: 1, tile: { x: 11, y: 6 }, sprite: 'items.wiesenbluete', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.bluete.links', item: 'item.wiesenbluete', count: 1, tile: { x: 2, y: 14 }, sprite: 'items.wiesenbluete', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.bluete.rechts', item: 'item.wiesenbluete', count: 1, tile: { x: 12, y: 19 }, sprite: 'items.wiesenbluete', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.kiesel.links', item: 'item.glitzerkiesel', count: 1, tile: { x: 4, y: 10 }, sprite: 'items.glitzerkiesel', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.kiesel.rechts', item: 'item.glitzerkiesel', count: 1, tile: { x: 9, y: 16 }, sprite: 'items.glitzerkiesel', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.seerose.links', item: 'item.seerosenblatt', count: 1, tile: { x: 2, y: 5 }, sprite: 'items.seerosenblatt', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.seerose.rechts', item: 'item.seerosenblatt', count: 1, tile: { x: 7, y: 8 }, sprite: 'items.seerosenblatt', regrowMinutes: NACHWACHSEN_MIN },
  ],
  exits: [
    {
      id: 'exit.zum-ufer',
      label: 'Startufer',
      tiles: [
        { x: 14, y: 27 },
        { x: 15, y: 27 },
        { x: 14, y: 28 },
        { x: 15, y: 28 },
      ],
      to: { map: MAP_STARTUFER, entry: 'entry.vom-bach' },
      keepName: 'den Weg zurück zum Ufer',
    },
  ],
  entries: [{ id: 'entry.vom-ufer', tile: { x: 13, y: 27 }, facing: 'sw' }],
  decorZone: { x: 10, y: 1, w: 5, h: 30 },
  keepReachable: [
    { tile: { x: 9, y: 13 }, name: 'die Brücke' },
    { tile: { x: 9, y: 23 }, name: 'die Brücke' },
    { tile: { x: 11, y: 22 }, name: 'den Bastelstumpf' },
    { tile: { x: 12, y: 17 }, name: 'Lumis Picknickplatz' },
  ],
  ambience: 'ambience.tiramisu-stream',
  backdrop: '#4d7d38',
};

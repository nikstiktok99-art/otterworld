import type { MapDef } from '../types';
import { MAP_FUCHSBAU, MAP_TIRAMISU, NACHWACHSEN_MIN } from '../ids';

// Fuchsbau (Ort aus dem Masterprompt; Gestaltung offen, Bild macht Codex).
// Vorschlag: eine Waldlichtung mit dem Fuchsbau oben, Beerensträuchern, Moos und Tannenzapfen; Bean wohnt hier.
// Weg unten führt zum Tiramisu Stream. 16 × 30 Kacheln.
// Legende: , Waldboden · * Blumen · - Weg · # Bäume und Büsche (nicht begehbar)
const grid = [
  '################', //  0
  '####,,,,,,,,####', //  1
  '###,,,,,,,,,,###', //  2
  '##,,,,,,,,,,,,##', //  3  Fuchsbau
  '##,,,,,,,,,,,,##', //  4
  '#,,,,,,,,,,,,,,#', //  5
  '#,,#,,,,,,,,#,,#', //  6
  '#,,,,,,,,,,,,,,#', //  7
  '#,,,,*,,,,,,,,,#', //  8
  '#,#,,,,,,,,,,#,#', //  9
  '#,,,,,,,,,,,,,,#', // 10
  '#,,,,,,,,,*,,,,#', // 11
  '##,,,,,,,,,,,,##', // 12  Bean
  '#,,,,,,,,,,,,,,#', // 13
  '#,,,#,,,,,,#,,,#', // 14
  '#,,,,,,,,,,,,,,#', // 15
  '#,*,,,,,,,,,,,,#', // 16
  '#,#,,,,,,,,,,#,#', // 17
  '#,,,,,,,,,,,,,,#', // 18
  '#,,,,,,,,,,,*,,#', // 19
  '##,,,,,,,,,,,,##', // 20
  '#,,,,,,,,,,,,,,#', // 21  Baumstumpf
  '#,,,,,,,,,,,,,,#', // 22
  '#,,#,,,,,,,,#,,#', // 23
  '#,,,,,,,,,,,,,,#', // 24
  '#,,,*,,,,,,,,,,#', // 25
  '#,,,,,,,,,,,,,,#', // 26
  '##,,,,,,,,,,,,##', // 27
  '###,,,,--,,,,###', // 28
  '#######--#######', // 29  Weg zum Tiramisu Stream
];

export const fuchsbau: MapDef = {
  id: MAP_FUCHSBAU,
  name: 'Fuchsbau',
  at: 'beim Fuchsbau',
  grid,
  legend: { ',': 'grass', '*': 'blumen', '-': 'pfad', '#': 'blocked' },
  arrival: { x: 8, y: 26 },
  objects: [
    {
      id: 'obj.fuchsbau',
      name: 'Fuchsbau',
      sprite: 'objects.fuchsbau',
      tile: { x: 6, y: 3 },
      footprint: { w: 3, h: 2 },
      interaction: { kind: 'inspect', text: 'Der Fuchsbau. Drinnen ist es still – wer hier wohnt, schläft wohl gerade.' },
    },
    {
      id: 'obj.baumstumpf',
      name: 'Baumstumpf',
      sprite: 'objects.bastelstumpf',
      tile: { x: 7, y: 21 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'workbench', title: 'Baumstumpf' },
    },
    {
      id: 'obj.wegweiser.bach',
      name: 'Wegweiser',
      sprite: 'objects.wegweiser',
      tile: { x: 9, y: 27 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'exit', exit: 'exit.zum-bach' },
    },
  ],
  gatherSpots: [
    { id: 'spot.zapfen.links', item: 'item.tannenzapfen', count: 1, tile: { x: 2, y: 7 }, sprite: 'items.tannenzapfen', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.zapfen.rechts', item: 'item.tannenzapfen', count: 1, tile: { x: 13, y: 10 }, sprite: 'items.tannenzapfen', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.zapfen.mitte', item: 'item.tannenzapfen', count: 1, tile: { x: 4, y: 16 }, sprite: 'items.tannenzapfen', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.zapfen.unten', item: 'item.tannenzapfen', count: 1, tile: { x: 12, y: 18 }, sprite: 'items.tannenzapfen', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.beere.oben', item: 'item.beere', count: 1, tile: { x: 10, y: 5 }, sprite: 'items.beerenstrauch', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.beere.links', item: 'item.beere', count: 1, tile: { x: 3, y: 12 }, sprite: 'items.beerenstrauch', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.moos.rechts', item: 'item.moos', count: 1, tile: { x: 11, y: 15 }, sprite: 'items.moos', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.moos.unten', item: 'item.moos', count: 1, tile: { x: 2, y: 24 }, sprite: 'items.moos', regrowMinutes: NACHWACHSEN_MIN },
  ],
  exits: [
    {
      id: 'exit.zum-bach',
      label: 'Tiramisu Stream',
      tiles: [
        { x: 7, y: 29 },
        { x: 8, y: 29 },
      ],
      to: { map: MAP_TIRAMISU, entry: 'entry.vom-wald' },
      keepName: 'den Weg zum Tiramisu Stream',
    },
  ],
  entries: [{ id: 'entry.vom-bach', tile: { x: 7, y: 28 }, facing: 'ne' }],
  decorZone: { x: 1, y: 13, w: 14, h: 14 },
  keepReachable: [
    { tile: { x: 7, y: 22 }, name: 'den Baumstumpf' },
    { tile: { x: 7, y: 5 }, name: 'den Fuchsbau' },
  ],
  ambience: 'ambience.fuchsbau',
  backdrop: '#2e4c22',
};

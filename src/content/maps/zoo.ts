import type { MapDef } from '../types';
import { MAP_STARTUFER, MAP_ZOO, NACHWACHSEN_MIN, Q_WIMPEL } from '../ids';

// Zoo (Ort aus dem Masterprompt; Gestaltung offen, Bild macht Codex).
// Vorschlag für den Aufbau: ein Weg von oben nach unten, links Meerkats Gehege mit Aussichtsstein, rechts das
// Robbenbecken für Squichy, unten eine Wiese mit Werkbank. 16 × 32 Kacheln.
// Legende: , Gras · * Blumen · - Weg · : Sand · ~ Wasser · z Zaun · # Büsche (Zaun und Büsche nicht begehbar)
const grid = [
  '#######--#######', //  0  Weg zum Startufer
  '#,,,,,,--,,,,,,#', //  1  Wegweiser
  '#,*,,,,--,,,*,,#', //  2
  '#zzzzzz--,,,,,,#', //  3  Gehege
  '#z::::z--,,,,,,#', //  4
  '#z::::z--,,*,,,#', //  5  Aussichtsstein
  '#z::::,--,,,,,,#', //  6  Meerkat, Durchgang
  '#z::::z--,,,,,,#', //  7
  '#zzzzzz--,,,,,,#', //  8
  '#,,,,,,--,,,,,,#', //  9
  '#,,,,,,--,,,,*,#', // 10
  '#,,,,,,--zzzzzz#', // 11  Robbenbecken
  '#,,,,,,--z::::z#', // 12
  '#,,,,,,--z:~~:z#', // 13
  '#,,,,,,---:~~:z#', // 14  Squichy, Durchgang
  '#,,,,,,--z:~~:z#', // 15
  '#,,,,,,--z:~~:z#', // 16
  '#,,,,,,--z::::z#', // 17
  '#,,,,,,--zzzzzz#', // 18
  '#,,,,,,--,,,,,,#', // 19
  '#,,,,,,--,,,,,,#', // 20
  '#,,,,,,--,,,,,,#', // 21
  '#,*,,,,--,,,,,,#', // 22
  '#,,,,,,--,,,,,,#', // 23  Werkbank
  '#,,,,,,--,,,,,,#', // 24
  '#,,,,,,--,,,,,,#', // 25
  '#,,,,,,--,,,,,,#', // 26
  '#,,*,,,--,,,*,,#', // 27
  '#,,,,,,--,,,,,,#', // 28
  '#,,,,,,--,,,,,,#', // 29
  '#,,,,,,,,,,,,,,#', // 30
  '################', // 31
];

export const zoo: MapDef = {
  id: MAP_ZOO,
  name: 'Zoo',
  at: 'im Zoo',
  grid,
  legend: { ',': 'grass', '*': 'blumen', '-': 'pfad', ':': 'sand', '~': 'water', z: 'zaun', '#': 'blocked' },
  arrival: { x: 8, y: 9 },
  objects: [
    {
      id: 'obj.aussichtsstein',
      name: 'Aussichtsstein',
      sprite: 'objects.aussichtsstein',
      tile: { x: 3, y: 5 },
      footprint: { w: 2, h: 1 },
      variants: [{ when: { questDone: Q_WIMPEL }, sprite: 'objects.aussichtsstein.wimpel' }],
      interaction: { kind: 'inspect', text: 'Meerkats Aussichtsstein. Von hier oben sieht man den ganzen Zoo.' },
    },
    {
      id: 'obj.werkbank.zoo',
      name: 'Werkbank',
      sprite: 'objects.werkbank',
      tile: { x: 11, y: 23 },
      footprint: { w: 2, h: 1 },
      interaction: { kind: 'workbench' },
    },
    {
      id: 'obj.wegweiser.ufer',
      name: 'Wegweiser',
      sprite: 'objects.wegweiser',
      tile: { x: 9, y: 1 },
      footprint: { w: 1, h: 1 },
      interaction: { kind: 'exit', exit: 'exit.zum-ufer' },
    },
  ],
  gatherSpots: [
    { id: 'spot.feder.gehege', item: 'item.feder', count: 1, tile: { x: 4, y: 10 }, sprite: 'items.feder', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.feder.wiese', item: 'item.feder', count: 1, tile: { x: 3, y: 15 }, sprite: 'items.feder', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.feder.unten', item: 'item.feder', count: 1, tile: { x: 11, y: 26 }, sprite: 'items.feder', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.sonnenblume.oben', item: 'item.sonnenblumenkern', count: 1, tile: { x: 12, y: 2 }, sprite: 'items.sonnenblume', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.sonnenblume.mitte', item: 'item.sonnenblumenkern', count: 1, tile: { x: 13, y: 10 }, sprite: 'items.sonnenblume', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.sonnenblume.unten', item: 'item.sonnenblumenkern', count: 1, tile: { x: 2, y: 22 }, sprite: 'items.sonnenblume', regrowMinutes: NACHWACHSEN_MIN },
  ],
  exits: [
    {
      id: 'exit.zum-ufer',
      label: 'Startufer',
      tiles: [
        { x: 7, y: 0 },
        { x: 8, y: 0 },
      ],
      to: { map: MAP_STARTUFER, entry: 'entry.vom-zoo' },
      keepName: 'den Weg zurück zum Ufer',
    },
  ],
  entries: [{ id: 'entry.vom-ufer', tile: { x: 7, y: 2 }, facing: 'se' }],
  decorZone: { x: 9, y: 19, w: 6, h: 11 },
  keepReachable: [
    { tile: { x: 6, y: 6 }, name: 'das Gehege' },
    { tile: { x: 9, y: 14 }, name: 'das Becken' },
    { tile: { x: 11, y: 24 }, name: 'die Werkbank' },
  ],
  ambience: 'ambience.zoo',
  backdrop: '#4d7d38',
};

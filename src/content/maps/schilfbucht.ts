import type { MapDef } from '../types';
import { MAP_SCHILFBUCHT, MAP_STARTUFER, NACHWACHSEN_MIN, Q_SCHILF } from '../ids';

// Vorschlag für Phase 2: eine kleine zweite Map, die Hin- und Rückweg und den Ortswechsel prüft.
// Kein persönlicher Ort – Name und Gestaltung sind frei austauschbar. 16 × 30 Kacheln.
// Legende: ~ Wasser · | Schilf (nicht begehbar) · : Sand · , Gras · - Pfad · # Büsche (nicht begehbar)
const grid = [
  '################', //  0
  '###||||||||||###', //  1
  '##||~~~~~~~~||##', //  2
  '#||~~~~~~~~~~||#', //  3
  '#|~~~~~~~~~~~~|#', //  4
  '#|~~~~~~~~~~~~|#', //  5
  '#|~~~~~~~~~~~~|#', //  6  Schilfhalm im Wasser
  '#||~~~~~~~~~~||#', //  7
  '#|~~~~~~~~~~~~|#', //  8
  '#|~~~~~~~~~~~~|#', //  9
  '#||~~~~~~~~~~||#', // 10
  '#:|~~~~~~~~~~|:#', // 11
  '#::|~~~~~~~~|::#', // 12  Schilfhalme links und rechts
  '#:::~~~~~~~~:::#', // 13
  '#::::~~~~~~::::#', // 14
  '#:::::~~~~:::::#', // 15
  '#::::::::::::::#', // 16
  '#,::::::::::::,#', // 17  Schnabbi
  '#,,::::::::::,,#', // 18
  '#,,,,::::::,,,,#', // 19
  '#,,,,,,,,,,,,#,#', // 20
  '#,,,,,,,,,,,,,,#', // 21
  '#,,,,#,,,,,,,,,#', // 22
  '#,,,,,,,,,,,,,,#', // 23  Wegweiser
  '--,,,,,,,,,,,,,#', // 24  Pfad zum Startufer
  '--,,,,,,,,,,,,,#', // 25
  '#,,,,,,,,,,#,,,#', // 26
  '#,,,,,,,,,,,,,,#', // 27
  '#,,,,,,,,,,,,,,#', // 28
  '################', // 29
];

const reedsGrow = { not: { questNotStarted: Q_SCHILF } };

export const schilfbucht: MapDef = {
  id: MAP_SCHILFBUCHT,
  name: 'Schilfbucht',
  at: 'in der Schilfbucht',
  grid,
  legend: { '~': 'water', '|': 'schilf', ':': 'sand', ',': 'grass', '-': 'pfad', '#': 'blocked' },
  arrival: { x: 3, y: 25 },
  objects: [
    {
      id: 'obj.wegweiser.ufer',
      name: 'Wegweiser',
      sprite: 'objects.wegweiser',
      tile: { x: 1, y: 23 },
      footprint: { w: 1, h: 1 },
      flip: true,
      interaction: { kind: 'exit', exit: 'exit.zum-ufer' },
    },
  ],
  gatherSpots: [
    { id: 'spot.schilf.links', item: 'item.schilfhalm', count: 1, tile: { x: 2, y: 12 }, sprite: 'items.schilfhalm', availableWhen: reedsGrow, regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.schilf.rechts', item: 'item.schilfhalm', count: 1, tile: { x: 13, y: 12 }, sprite: 'items.schilfhalm', availableWhen: reedsGrow, regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.schilf.wasser', item: 'item.schilfhalm', count: 1, tile: { x: 2, y: 6 }, sprite: 'items.schilfhalm', availableWhen: reedsGrow, regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.treibholz.bucht', item: 'item.treibholz', count: 1, tile: { x: 3, y: 15 }, sprite: 'items.treibholz', regrowMinutes: NACHWACHSEN_MIN },
    { id: 'spot.muschel.bucht', item: 'item.muschelschale', count: 1, tile: { x: 12, y: 16 }, sprite: 'items.muschelschale', regrowMinutes: NACHWACHSEN_MIN },
  ],
  exits: [
    {
      id: 'exit.zum-ufer',
      label: 'Startufer',
      tiles: [
        { x: 0, y: 24 },
        { x: 1, y: 24 },
        { x: 0, y: 25 },
        { x: 1, y: 25 },
      ],
      to: { map: MAP_STARTUFER, entry: 'entry.von-der-bucht' },
      keepName: 'den Weg zurück zum Ufer',
    },
  ],
  entries: [{ id: 'entry.vom-ufer', tile: { x: 2, y: 24 }, facing: 'se' }],
  keepReachable: [],
  ambience: 'ambience.schilfbucht.abend',
  overview: { x: 80, y: 30 },
  backdrop: '#4d7d38',
};

import type { EncounterDef } from './types';
import { MAP_CAFE, MAP_FUCHSBAU, MAP_HOTPOT, MAP_SCHILFBUCHT, MAP_STARTUFER, MAP_TIRAMISU, MAP_ZOO, Q_KLETTER, Q_LICHT, Q_PICKNICK, Q_SCHILF } from './ids';

// Wo sich jeder Weltkörper aufhält – über alle Maps hinweg. Pro Körper genau eine Begegnung;
// die erste passende Platzierung gilt. Der Körper, den die Spielerin gerade steuert, steht nie zusätzlich herum.
export const encounters: EncounterDef[] = [
  {
    id: 'enc.schnabbi',
    characters: ['schnabbi'],
    placements: [
      {
        when: { questStep: { quest: Q_LICHT, step: 'abend' } },
        map: MAP_STARTUFER,
        at: { besideDeco: 'item.uferleuchte' },
        pose: 'sit',
        facing: 'se',
        talkOnArrival: { questStep: { quest: Q_LICHT, step: 'abend' } },
      },
      {
        // Er geht voraus und wartet in der Bucht, bis die Halme beisammen sind.
        when: { any: [{ questStep: { quest: Q_SCHILF, step: 'hinueber' } }, { questStep: { quest: Q_SCHILF, step: 'schilf' } }] },
        map: MAP_SCHILFBUCHT,
        at: { tile: { x: 7, y: 17 } },
        pose: 'idle',
        facing: 'ne',
      },
      {
        when: { questStep: { quest: Q_SCHILF, step: 'gemeinsam' } },
        map: MAP_STARTUFER,
        at: { besideDeco: 'item.schilfmatte' },
        pose: 'sit',
        facing: 'se',
        talkOnArrival: { questStep: { quest: Q_SCHILF, step: 'gemeinsam' } },
      },
      { when: { questDone: Q_SCHILF }, map: MAP_STARTUFER, at: { besideDeco: 'item.schilfmatte' }, pose: 'sit', facing: 'se' },
      { when: { questDone: Q_LICHT }, map: MAP_STARTUFER, at: { besideDeco: 'item.uferleuchte' }, pose: 'sit', facing: 'se' },
      { map: MAP_STARTUFER, at: { tile: { x: 10, y: 8 } }, pose: 'idle', facing: 'se' },
    ],
  },
  {
    // Lumi taucht erst nach Schnabbis zweitem Erlebnis auf (Kanon: ihre Begegnung folgt nach Schnabbi).
    id: 'enc.lumi',
    characters: ['otterprinzessin'],
    placements: [
      {
        when: { questStep: { quest: Q_PICKNICK, step: 'picknick' } },
        map: MAP_TIRAMISU,
        at: { besideDeco: 'item.bluetengirlande' },
        pose: 'sit',
        facing: 'se',
        talkOnArrival: { questStep: { quest: Q_PICKNICK, step: 'picknick' } },
      },
      { when: { questDone: Q_PICKNICK }, map: MAP_TIRAMISU, at: { besideDeco: 'item.bluetengirlande' }, pose: 'sit', facing: 'se' },
      { when: { questDone: Q_SCHILF }, map: MAP_TIRAMISU, at: { tile: { x: 12, y: 17 } }, pose: 'idle', facing: 'ne' },
    ],
  },
  {
    // Rosie und Bubbles leben im Teich.
    id: 'enc.rosie',
    characters: ['rosie'],
    placements: [{ map: MAP_TIRAMISU, at: { tile: { x: 3, y: 6 } }, pose: 'idle', facing: 'se' }],
  },
  {
    id: 'enc.bubbles',
    characters: ['bubbles'],
    placements: [{ map: MAP_TIRAMISU, at: { tile: { x: 6, y: 5 } }, pose: 'idle', facing: 'sw' }],
  },
  {
    // Meerkat hält auf dem Aussichtsstein Wache.
    id: 'enc.meerkat',
    characters: ['meerkat'],
    placements: [{ map: MAP_ZOO, at: { tile: { x: 4, y: 6 } }, pose: 'idle', facing: 'se' }],
  },
  {
    // Squichy schwimmt im Robbenbecken.
    id: 'enc.squichy',
    characters: ['squichy'],
    placements: [{ map: MAP_ZOO, at: { tile: { x: 11, y: 14 } }, pose: 'idle', facing: 'sw' }],
  },
  {
    // Chamaron versteckt sich neben der großen Pflanze – bis zur eigenen Kletterpflanze.
    id: 'enc.chamaron',
    characters: ['chamaron'],
    placements: [
      {
        when: { questStep: { quest: Q_KLETTER, step: 'gemeinsam' } },
        map: MAP_CAFE,
        at: { besideDeco: 'item.kletterpflanze' },
        pose: 'idle',
        facing: 'se',
        talkOnArrival: { questStep: { quest: Q_KLETTER, step: 'gemeinsam' } },
      },
      { when: { questDone: Q_KLETTER }, map: MAP_CAFE, at: { besideDeco: 'item.kletterpflanze' }, pose: 'idle', facing: 'se' },
      { map: MAP_CAFE, at: { tile: { x: 13, y: 13 } }, pose: 'idle', facing: 'sw' },
    ],
  },
  {
    // Beano, Beani und Beanz: ein Körper, eine Schale – an der Theke im Hotpot-Restaurant.
    id: 'enc.erbsen',
    characters: ['beano', 'beani', 'beanz'],
    placements: [{ map: MAP_HOTPOT, at: { tile: { x: 8, y: 9 } }, pose: 'idle', facing: 'se' }],
  },
  {
    // Bean wohnt auf der Lichtung beim Fuchsbau.
    id: 'enc.bean',
    characters: ['bean'],
    placements: [{ map: MAP_FUCHSBAU, at: { tile: { x: 8, y: 12 } }, pose: 'idle', facing: 'se' }],
  },
  {
    // Spielt sie gerade als jemand anderes, ruht ihr Otter vor dem Bau.
    id: 'enc.otter',
    characters: ['otter'],
    placements: [{ map: MAP_STARTUFER, at: { tile: { x: 5, y: 25 } }, pose: 'idle', facing: 'sw' }],
  },
];

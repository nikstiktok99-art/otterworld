import type { EncounterDef } from './types';
import { MAP_SCHILFBUCHT, MAP_STARTUFER, MAP_TIRAMISU, MAP_ZOO, Q_LICHT, Q_PICKNICK, Q_SCHILF } from './ids';

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
    // Spielt sie gerade als jemand anderes, ruht ihr Otter vor dem Bau.
    id: 'enc.otter',
    characters: ['otter'],
    placements: [{ map: MAP_STARTUFER, at: { tile: { x: 5, y: 25 } }, pose: 'idle', facing: 'sw' }],
  },
];

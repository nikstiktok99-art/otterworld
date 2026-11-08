import type { EncounterDef } from './types';
import { MAP_SCHILFBUCHT, MAP_STARTUFER, Q_LICHT, Q_SCHILF } from './ids';

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
    // Spielt sie gerade als jemand anderes, ruht ihr Otter vor dem Bau.
    id: 'enc.otter',
    characters: ['otter'],
    placements: [{ map: MAP_STARTUFER, at: { tile: { x: 5, y: 25 } }, pose: 'idle', facing: 'sw' }],
  },
];

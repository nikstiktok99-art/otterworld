import type { MomentDef, QuestDef } from './types';
import { M_ERSTER_ABEND, M_PLATZ_FUER_ZWEI, MAP_SCHILFBUCHT, Q_LICHT, Q_SCHILF, R_LEUCHTE, R_MATTE } from './ids';

// Vorschläge, austauschbar. Phase 1: Am Steg fehlt abends ein Licht.
// Phase 2: Ein zweites gemeinsames Erlebnis – Schnabbi zeigt dir die Schilfbucht, ihr flechtet eine Matte,
// danach vertraut er dir und ist im Freundebuch spielbar.
export const quests: Record<string, QuestDef> = {
  [Q_LICHT]: {
    id: Q_LICHT,
    name: 'Ein Licht am Steg',
    steps: [
      {
        id: 'sammeln',
        hint: 'Uferleuchte: Treibholz {count:item.treibholz}/2 · Muschelschale {count:item.muschelschale}/1',
        completeWhen: { hasItems: { 'item.treibholz': 2, 'item.muschelschale': 1 } },
      },
      {
        id: 'bauen',
        hint: 'Alles beisammen – zur Werkbank neben deinem Bau',
        completeWhen: { crafted: R_LEUCHTE },
      },
      {
        id: 'aufstellen',
        hint: 'Uferleuchte aufstellen – im Beutel',
        completeWhen: { placed: 'item.uferleuchte' },
      },
      {
        id: 'abend',
        hint: 'Schnabbi wartet an der Leuchte',
        completeWhen: { dialogue: 'dlg.schnabbi.abschluss' },
        onComplete: [
          { setDecoOn: { item: 'item.uferleuchte', on: true } },
          { addMoment: M_ERSTER_ABEND },
        ],
      },
    ],
    ending: {
      title: 'Der erste Abend',
      text: 'Die Uferleuchte brennt, und Schnabbi sitzt bei dir am Steg, {name}. Bleib, solange du magst.',
    },
  },
  [Q_SCHILF]: {
    id: Q_SCHILF,
    name: 'Ein Platz für zwei',
    offer: { when: { questDone: Q_LICHT }, hint: 'Schnabbi hat eine Idee – sprich ihn an' },
    steps: [
      {
        id: 'hinueber',
        hint: 'Folge Schnabbi in die Schilfbucht – der Weg beginnt am Wegweiser rechts',
        completeWhen: { atMap: MAP_SCHILFBUCHT },
      },
      {
        id: 'schilf',
        hint: 'Schilfhalme {count:item.schilfhalm}/3',
        completeWhen: { hasItems: { 'item.schilfhalm': 3 } },
      },
      {
        id: 'flechten',
        hint: 'Zurück zur Werkbank: Schilfmatte flechten',
        completeWhen: { crafted: R_MATTE },
      },
      {
        id: 'hinlegen',
        hint: 'Schilfmatte hinlegen – im Beutel',
        completeWhen: { placed: 'item.schilfmatte' },
      },
      {
        id: 'gemeinsam',
        hint: 'Schnabbi wartet an der Matte',
        completeWhen: { dialogue: 'dlg.schnabbi.vertrauen' },
        onComplete: [{ addMoment: M_PLATZ_FUER_ZWEI }, { unlockCharacter: 'schnabbi' }],
      },
    ],
    ending: {
      title: 'Ein Platz für zwei',
      text: 'Die Schilfmatte liegt am Ufer, und Schnabbi hat es sich dort gemütlich gemacht. Er vertraut dir jetzt, {name}.',
    },
  },
};

/** Gemeinsame Erlebnisse (Vertrauen). Sie stehen im Freundebuch. */
export const moments: Record<string, MomentDef> = {
  [M_ERSTER_ABEND]: {
    id: M_ERSTER_ABEND,
    character: 'schnabbi',
    title: 'Der erste Abend',
    text: 'Ihr habt eine Uferleuchte gebaut. Schnabbi hat sie angestupst, und seitdem leuchtet sie.',
  },
  [M_PLATZ_FUER_ZWEI]: {
    id: M_PLATZ_FUER_ZWEI,
    character: 'schnabbi',
    title: 'Ein Platz für zwei',
    text: 'Mit Schilf aus der Bucht habt ihr eine Matte geflochten, auf der ihr abends zusammen sitzt.',
  },
};

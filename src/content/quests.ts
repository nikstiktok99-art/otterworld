import type { MomentDef, QuestDef } from './types';
import {
  M_BALL,
  M_BUBBLES_KISSEN,
  M_ERSTER_ABEND,
  M_PICKNICK,
  M_PLATZ_FUER_ZWEI,
  M_ROSIE_KISSEN,
  M_WIMPEL,
  MAP_SCHILFBUCHT,
  Q_BALL,
  Q_KISSEN,
  Q_LICHT,
  Q_PICKNICK,
  Q_SCHILF,
  Q_WIMPEL,
  R_BALL,
  R_GIRLANDE,
  R_KIESELLICHT,
  R_KISSEN,
  R_LEUCHTE,
  R_MATTE,
  R_TOPF,
  R_WIMPEL,
} from './ids';

// Vorschläge, austauschbar. Phase 1: Am Steg fehlt abends ein Licht.
// Phase 2: Ein zweites gemeinsames Erlebnis – Schnabbi zeigt dir die Schilfbucht, ihr flechtet eine Matte,
// danach vertraut er dir und ist im Freundebuch spielbar.
export const quests: Record<string, QuestDef> = {
  [Q_LICHT]: {
    id: Q_LICHT,
    name: 'Ein Licht am Steg',
    giver: 'schnabbi',
    offer: { when: { questNotStarted: Q_LICHT }, hint: 'Schnabbi wartet am Ende des Stegs' },
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
    giver: 'schnabbi',
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

  // ---- Kapitel Tiramisu Stream (Vorschlag) ----
  [Q_PICKNICK]: {
    id: Q_PICKNICK,
    name: 'Ein Picknick am Bach',
    giver: 'otterprinzessin',
    offer: { when: { questDone: Q_SCHILF }, hint: 'Am Tiramisu Stream ist jemand Neues – der Weg beginnt links neben deinem Bau' },
    steps: [
      {
        id: 'sammeln',
        hint: 'Picknick: Wiesenblüten {count:item.wiesenbluete}/3 · Glitzerkiesel {count:item.glitzerkiesel}/1',
        completeWhen: { hasItems: { 'item.wiesenbluete': 3, 'item.glitzerkiesel': 1 } },
      },
      {
        id: 'basteln',
        hint: 'Eine Blütengirlande basteln – am Bastelstumpf',
        completeWhen: { crafted: R_GIRLANDE },
      },
      {
        id: 'aufhaengen',
        hint: 'Blütengirlande beim Picknickplatz aufhängen – im Beutel',
        completeWhen: { placed: 'item.bluetengirlande' },
      },
      {
        id: 'picknick',
        hint: 'Lumi wartet zum Picknick',
        completeWhen: { dialogue: 'dlg.lumi.picknick' },
        onComplete: [{ addMoment: M_PICKNICK }, { learnRecipe: R_KIESELLICHT }, { unlockCharacter: 'otterprinzessin' }],
      },
    ],
    ending: {
      title: 'Ein Picknick am Bach',
      text: 'Die Blütengirlande schaukelt im Wind, und Lumi teilt ihre Kekse mit dir, {name}. Gleich nebenan blubbert es im Teich.',
    },
  },
  [Q_KISSEN]: {
    id: Q_KISSEN,
    name: 'Ein Kissen für Rosie',
    giver: 'rosie',
    offer: { when: { questDone: Q_PICKNICK }, hint: 'Im Teich am Tiramisu Stream blubbert es – sag Hallo' },
    steps: [
      {
        id: 'sammeln',
        hint: 'Seerosenkissen: Seerosenblätter {count:item.seerosenblatt}/2 · Wiesenblüte {count:item.wiesenbluete}/1',
        completeWhen: { hasItems: { 'item.seerosenblatt': 2, 'item.wiesenbluete': 1 } },
      },
      {
        id: 'basteln',
        hint: 'Ein Seerosenkissen basteln – am Bastelstumpf',
        completeWhen: { crafted: R_KISSEN },
      },
      {
        id: 'bringen',
        hint: 'Bring Rosie das Seerosenkissen',
        completeWhen: { dialogue: 'dlg.rosie.danke' },
        onComplete: [{ addMoment: M_ROSIE_KISSEN }, { addMoment: M_BUBBLES_KISSEN }],
      },
    ],
    ending: {
      title: 'Ein Kissen für Rosie',
      text: 'Rosie kuschelt sich ins Seerosenkissen, und Bubbles blubbert vor Freude. Jetzt hast du zwei Freunde im Teich.',
    },
  },

  // ---- Kapitel Zoo (Vorschlag) ----
  [Q_WIMPEL]: {
    id: Q_WIMPEL,
    name: 'Ein Wimpel für Meerkat',
    giver: 'meerkat',
    offer: { when: { questDone: Q_KISSEN }, hint: 'Im Zoo hält jemand Wache – der Weg beginnt unten am Startufer' },
    steps: [
      {
        id: 'sammeln',
        hint: 'Federwimpel: Federn {count:item.feder}/2 · Treibholz {count:item.treibholz}/1',
        completeWhen: { hasItems: { 'item.feder': 2, 'item.treibholz': 1 } },
      },
      { id: 'basteln', hint: 'Einen Federwimpel basteln – an der Werkbank im Zoo', completeWhen: { crafted: R_WIMPEL } },
      {
        id: 'bringen',
        hint: 'Bring Meerkat den Federwimpel',
        completeWhen: { dialogue: 'dlg.meerkat.danke' },
        onComplete: [{ addMoment: M_WIMPEL }, { learnRecipe: R_TOPF }],
      },
    ],
    ending: {
      title: 'Ein Wimpel für Meerkat',
      text: 'Auf dem Aussichtsstein flattert jetzt ein bunter Wimpel. Wer Meerkat sucht, findet ihn sofort.',
    },
  },
  [Q_BALL]: {
    id: Q_BALL,
    name: 'Ein Ball für Squichy',
    giver: 'squichy',
    offer: { when: { questDone: Q_WIMPEL }, hint: 'Im Robbenbecken im Zoo wartet jemand Kleines' },
    steps: [
      {
        id: 'sammeln',
        hint: 'Schilfball: Schilfhalme {count:item.schilfhalm}/2 · Glitzerkiesel {count:item.glitzerkiesel}/1',
        completeWhen: { hasItems: { 'item.schilfhalm': 2, 'item.glitzerkiesel': 1 } },
      },
      { id: 'basteln', hint: 'Einen Schilfball basteln', completeWhen: { crafted: R_BALL } },
      {
        id: 'bringen',
        hint: 'Bring Squichy den Schilfball',
        completeWhen: { dialogue: 'dlg.squichy.danke' },
        onComplete: [{ addMoment: M_BALL }],
      },
    ],
    ending: {
      title: 'Ein Ball für Squichy',
      text: 'Squichy balanciert den Schilfball auf der Nase und will gar nicht mehr aufhören. Jetzt hat das Becken seinen kleinsten Star.',
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
  [M_PICKNICK]: {
    id: M_PICKNICK,
    character: 'otterprinzessin',
    title: 'Ein Picknick am Bach',
    text: 'Mit einer Blütengirlande wurde Lumis Picknick erst richtig schön. Danach hat sie dir gezeigt, wie Kiesel leuchten.',
  },
  [M_ROSIE_KISSEN]: {
    id: M_ROSIE_KISSEN,
    character: 'rosie',
    title: 'Ein Kissen für Rosie',
    text: 'Für Rosies Seerosenbett hast du ein weiches Kissen gebastelt.',
  },
  [M_BUBBLES_KISSEN]: {
    id: M_BUBBLES_KISSEN,
    character: 'bubbles',
    title: 'Blasen vor Freude',
    text: 'Als Rosie ihr Kissen bekam, hat Bubbles dir zwei Glitzerkiesel vom Teichgrund geschenkt.',
  },
  [M_WIMPEL]: {
    id: M_WIMPEL,
    character: 'meerkat',
    title: 'Ein Wimpel für Meerkat',
    text: 'Dein Federwimpel flattert auf Meerkats Aussichtsstein. Dafür gab es Sonnenblumenkerne.',
  },
  [M_BALL]: {
    id: M_BALL,
    character: 'squichy',
    title: 'Ein Ball für Squichy',
    text: 'Squichy hat zum ersten Mal einen eigenen Ball – aus Schilf, mit einem Glitzerkiesel, der raschelt.',
  },
};

import type { DialogueDef } from './types';
import { Q_LICHT, R_LEUCHTE } from './ids';

// ENTWURF: Alle Texte sind Vorschläge und dürfen frei ersetzt werden.
// {name} wird durch den Namen ersetzt, den die Spielerin im ersten Gespräch wählt.
// speaker: null = Erzähltext. cue = kleines Signal an die Welt (z. B. Leuchte geht an).
// Pro Figur gilt der erste Dialog, dessen Bedingung passt.

const QUEST_START = [{ startQuest: Q_LICHT }, { learnRecipe: R_LEUCHTE }];

export const dialogues: DialogueDef[] = [
  {
    id: 'dlg.schnabbi.begruessung',
    character: 'schnabbi',
    when: { all: [{ questNotStarted: Q_LICHT }, { hasName: false }] },
    lines: [
      { speaker: 'schnabbi', text: 'Oh! Hallo du. Dich habe ich hier am Ufer noch nie gesehen.' },
      { speaker: 'schnabbi', text: 'Ich bin Schnabbi. Ich wohne gleich hier am Steg.' },
      { speaker: 'schnabbi', text: 'Und wie heißt du?' },
      { askName: true },
      { speaker: 'schnabbi', text: '{name}! Was für ein schöner Name.' },
      { speaker: 'schnabbi', text: 'Sag mal, {name} … merkst du, wie dunkel es am Steg wird, wenn die Sonne weg ist?' },
      { speaker: 'schnabbi', text: 'Ein kleines Licht wäre schön. Dann finden wir abends immer zurück.' },
      {
        speaker: 'schnabbi',
        text: 'Ich zeig dir, wie man eine Uferleuchte baut: zwei Stück Treibholz und eine Muschelschale. Gebaut wird an der Werkbank neben deinem Bau.',
      },
    ],
    effects: QUEST_START,
  },
  {
    id: 'dlg.schnabbi.wiedersehen',
    character: 'schnabbi',
    when: { questNotStarted: Q_LICHT },
    lines: [
      { speaker: 'schnabbi', text: 'Da bist du ja wieder, {name}! Wo waren wir? Ach ja – das Licht am Steg.' },
      {
        speaker: 'schnabbi',
        text: 'Für eine Uferleuchte brauchst du zwei Stück Treibholz und eine Muschelschale. Gebaut wird an der Werkbank neben deinem Bau.',
      },
    ],
    effects: QUEST_START,
  },
  {
    id: 'dlg.schnabbi.sammeln',
    character: 'schnabbi',
    when: { questStep: { quest: Q_LICHT, step: 'sammeln' } },
    lines: [
      { speaker: 'schnabbi', text: 'Treibholz liegt am Ufer im Sand. Ein Stück treibt auch draußen im Wasser – du kannst ja schwimmen!' },
      { speaker: 'schnabbi', text: 'Muschelschalen findest du rechts im Sand.' },
    ],
  },
  {
    id: 'dlg.schnabbi.bauen',
    character: 'schnabbi',
    when: { questStep: { quest: Q_LICHT, step: 'bauen' } },
    lines: [{ speaker: 'schnabbi', text: 'Du hast alles beisammen, {name}! Die Werkbank steht neben deinem Bau.' }],
  },
  {
    id: 'dlg.schnabbi.aufstellen',
    character: 'schnabbi',
    when: { questStep: { quest: Q_LICHT, step: 'aufstellen' } },
    lines: [
      { speaker: 'schnabbi', text: 'Die Leuchte ist fertig? Wunderbar!' },
      { speaker: 'schnabbi', text: 'Such ihr einen Platz, der dir gefällt. Im Beutel kannst du sie aufstellen.' },
    ],
  },
  {
    id: 'dlg.schnabbi.abschluss',
    character: 'schnabbi',
    when: { questStep: { quest: Q_LICHT, step: 'abend' } },
    lines: [
      { speaker: 'schnabbi', text: 'Da steht sie ja. Darf ich?' },
      { speaker: null, text: 'Schnabbi stupst die Leuchte mit dem Schnabel an. Sie beginnt warm zu leuchten.', cue: 'leuchteAn' },
      { speaker: 'schnabbi', text: 'So ist der Abend am Ufer gleich viel gemütlicher.' },
      { speaker: 'schnabbi', text: 'Danke, {name}. Bleibst du noch ein bisschen?' },
    ],
  },
  {
    id: 'dlg.schnabbi.plaudern',
    character: 'schnabbi',
    when: { questDone: Q_LICHT },
    lines: [
      { speaker: 'schnabbi', text: 'Hörst du das Wasser, {name}? Ich könnte hier ewig sitzen.' },
      { speaker: 'schnabbi', text: 'Wenn du magst, kannst du die Leuchte im Beutel versetzen. Ich setz mich dann einfach wieder dazu.' },
    ],
  },
];

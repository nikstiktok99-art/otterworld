import type { DialogueDef } from './types';
import { Q_LICHT, Q_SCHILF, R_BANK, R_LEUCHTE, R_MATTE, R_WINDSPIEL } from './ids';

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
  // ---- Phase 2 (Vorschlag): Ein Platz für zwei ----
  {
    id: 'dlg.schnabbi.ausflug',
    character: 'schnabbi',
    when: { all: [{ questDone: Q_LICHT }, { questNotStarted: Q_SCHILF }] },
    lines: [
      { speaker: 'schnabbi', text: 'Weißt du, was mir am Abend noch fehlt, {name}? Der Sand wird ganz schön kühl.' },
      { speaker: 'schnabbi', text: 'Eine weiche Matte zum Draufsitzen wäre schön. Aus Schilf kann man eine flechten.' },
      {
        speaker: 'schnabbi',
        text: 'Hinter dem Ufer liegt eine kleine Bucht, da wächst das weichste Schilf. Kommst du mit?',
        choices: [
          { label: 'Gern, zeig sie mir!', then: 'weiter' },
          { label: 'Lieber später', then: 'spaeter' },
        ],
      },
      { speaker: 'schnabbi', text: 'Schön! Der Weg beginnt rechts am Wegweiser. Ich geh schon mal vor.' },
    ],
    effects: [{ startQuest: Q_SCHILF }, { learnRecipe: R_MATTE }],
  },
  {
    id: 'dlg.schnabbi.bucht',
    character: 'schnabbi',
    when: { questStep: { quest: Q_SCHILF, step: 'schilf' } },
    lines: [
      { speaker: 'schnabbi', text: 'Da bist du ja! Schön hier, oder?' },
      { speaker: 'schnabbi', text: 'Für eine Matte reichen drei Schilfhalme. Zwei wachsen am Ufer, einer draußen im Wasser am Schilf.' },
    ],
  },
  {
    id: 'dlg.schnabbi.flechten',
    character: 'schnabbi',
    when: { questStep: { quest: Q_SCHILF, step: 'flechten' } },
    lines: [{ speaker: 'schnabbi', text: 'Hast du die Halme? Dann ab zur Werkbank – flechten geht ganz leicht.' }],
  },
  {
    id: 'dlg.schnabbi.hinlegen',
    character: 'schnabbi',
    when: { questStep: { quest: Q_SCHILF, step: 'hinlegen' } },
    lines: [{ speaker: 'schnabbi', text: 'Die Matte ist fertig? Leg sie hin, wo es dir gefällt. Ich komm dann dazu.' }],
  },
  {
    id: 'dlg.schnabbi.vertrauen',
    character: 'schnabbi',
    when: { questStep: { quest: Q_SCHILF, step: 'gemeinsam' } },
    lines: [
      { speaker: 'schnabbi', text: 'Oh, ist die weich!' },
      { speaker: null, text: 'Schnabbi rückt ein Stück zur Seite, damit ihr beide Platz habt.' },
      { speaker: 'schnabbi', text: 'Weißt du, {name}, seit du da bist, ist es hier am Ufer viel schöner.' },
      { speaker: 'schnabbi', text: 'Wenn du magst, darfst du die Welt auch mal mit meinen Augen sehen. Schau dafür ins Freundebuch.' },
    ],
  },
  // ---- Freies Bauen (Vorschlag): Schnabbi zeigt zwei neue Rezepte ----
  {
    id: 'dlg.schnabbi.ideen',
    character: 'schnabbi',
    when: { questDone: Q_SCHILF },
    lines: [
      { speaker: 'schnabbi', text: 'Weißt du was, {name}? Mir sind noch ein paar Sachen eingefallen, die man bauen kann.' },
      { speaker: 'schnabbi', text: 'Eine kleine Bank aus Treibholz und ein Windspiel aus Muscheln. Schau mal an der Werkbank!' },
      { speaker: 'schnabbi', text: 'Treibholz und Muscheln gibt es immer wieder – das Wasser bringt ständig neue.' },
    ],
    effects: [{ learnRecipe: R_BANK }, { learnRecipe: R_WINDSPIEL }],
  },
  {
    id: 'dlg.schnabbi.plaudern2',
    character: 'schnabbi',
    when: { questDone: Q_SCHILF },
    lines: [
      { speaker: 'schnabbi', text: 'So lässt es sich aushalten, {name}.' },
      { speaker: 'schnabbi', text: 'Im Freundebuch kannst du jederzeit als ich herumtapsen. Dein Otter ruht sich so lange vor dem Bau aus.' },
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

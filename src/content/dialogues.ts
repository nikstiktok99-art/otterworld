import type { DialogueDef } from './types';
import { Q_BALL, Q_KISSEN, Q_LICHT, Q_PICKNICK, Q_SCHILF, Q_WIMPEL, R_BALL, R_BANK, R_GIRLANDE, R_KISSEN, R_LEUCHTE, R_MATTE, R_WIMPEL, R_WINDSPIEL } from './ids';

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
      { speaker: null, text: 'Schnabbi stupst die Leuchte mit dem Schnabel an. Sie beginnt warm zu leuchten.', cue: 'an:item.uferleuchte' },
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
    id: 'dlg.schnabbi.lumi',
    character: 'schnabbi',
    when: { all: [{ questDone: Q_SCHILF }, { questNotStarted: Q_PICKNICK }] },
    lines: [
      { speaker: 'schnabbi', text: 'Warst du schon am Tiramisu Stream? Der Weg beginnt links neben deinem Bau.' },
      { speaker: 'schnabbi', text: 'Da wohnt Lumi – eine Otter mit Kleid und Krone. Ich hab ihr schon von dir erzählt!' },
    ],
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

  // ---- Kapitel Tiramisu Stream (Vorschlag): Lumi ----
  {
    id: 'dlg.lumi.hallo',
    character: 'otterprinzessin',
    when: { all: [{ questDone: Q_SCHILF }, { questNotStarted: Q_PICKNICK }] },
    lines: [
      { speaker: 'otterprinzessin', text: 'Oh, Besuch! Du musst {name} sein – Schnabbi hat mir schon von dir erzählt. Ich bin Lumi.' },
      { speaker: 'otterprinzessin', text: 'Ich möchte heute ein Picknick am Bach machen, aber es sieht noch so schlicht aus.' },
      {
        speaker: 'otterprinzessin',
        text: 'Hilfst du mir, eine Blütengirlande zu basteln?',
        choices: [
          { label: 'Na klar!', then: 'weiter' },
          { label: 'Später vielleicht', then: 'spaeter' },
        ],
      },
      {
        speaker: 'otterprinzessin',
        text: 'Wunderbar! Wir brauchen drei Wiesenblüten und einen Glitzerkiesel. Basteln kannst du am Stumpf da unten.',
      },
    ],
    effects: [{ startQuest: Q_PICKNICK }, { learnRecipe: R_GIRLANDE }],
  },
  {
    id: 'dlg.lumi.sammeln',
    character: 'otterprinzessin',
    when: { questStep: { quest: Q_PICKNICK, step: 'sammeln' } },
    lines: [
      { speaker: 'otterprinzessin', text: 'Wiesenblüten wachsen überall auf der Wiese. Glitzerkiesel liegen am Bach im Sand.' },
      { speaker: 'otterprinzessin', text: 'Eine Blüte wächst sogar ganz oben hinter dem Teich – da kommst du nur schwimmend hin.' },
    ],
  },
  {
    id: 'dlg.lumi.basteln',
    character: 'otterprinzessin',
    when: { questStep: { quest: Q_PICKNICK, step: 'basteln' } },
    lines: [{ speaker: 'otterprinzessin', text: 'Du hast alles? Dann ab zum Bastelstumpf!' }],
  },
  {
    id: 'dlg.lumi.aufhaengen',
    character: 'otterprinzessin',
    when: { questStep: { quest: Q_PICKNICK, step: 'aufhaengen' } },
    lines: [{ speaker: 'otterprinzessin', text: 'Oh, ist die schön! Häng sie doch hier bei der Picknickdecke auf.' }],
  },
  {
    id: 'dlg.lumi.picknick',
    character: 'otterprinzessin',
    when: { questStep: { quest: Q_PICKNICK, step: 'picknick' } },
    lines: [
      { speaker: 'otterprinzessin', text: 'Perfekt! Jetzt ist es ein richtiges Picknick.' },
      { speaker: null, text: 'Lumi legt ein paar Kekse auf die Decke und rückt ihre Krone zurecht.' },
      { speaker: 'otterprinzessin', text: 'Ich zeig dir noch einen Trick: Zwei Glitzerkiesel in einer Muschel ergeben ein kleines Licht.' },
      { speaker: 'otterprinzessin', text: 'Und wenn du magst, darfst du auch mal mit Kleid und Krone herumspazieren. Schau ins Freundebuch!' },
    ],
  },
  {
    id: 'dlg.lumi.teich',
    character: 'otterprinzessin',
    when: { all: [{ questDone: Q_PICKNICK }, { questNotStarted: Q_KISSEN }] },
    lines: [{ speaker: 'otterprinzessin', text: 'Im Teich wohnen übrigens Rosie und Bubbles. Sag ihnen doch mal Hallo!' }],
  },
  {
    id: 'dlg.lumi.plaudern',
    character: 'otterprinzessin',
    when: { questDone: Q_PICKNICK },
    lines: [{ speaker: 'otterprinzessin', text: 'Schön, dass du da bist, {name}. Der Bach klingt heute besonders fröhlich.' }],
  },

  // ---- Kapitel Tiramisu Stream (Vorschlag): Rosie und Bubbles ----
  {
    id: 'dlg.rosie.hallo',
    character: 'rosie',
    when: { all: [{ questDone: Q_PICKNICK }, { questNotStarted: Q_KISSEN }] },
    lines: [
      { speaker: 'rosie', text: 'Hallo! Ich bin Rosie. Und das hier ist mein Bruder Bubbles.' },
      { speaker: 'bubbles', text: 'Blubb! Hallo!' },
      { speaker: 'rosie', text: 'Bubbles macht dauernd Blasen, sogar im Schlaf. Da wackelt mein Seerosenbett ganz schön.' },
      {
        speaker: 'rosie',
        text: 'Ein weiches Kissen aus Seerosenblättern wäre toll. Bastelst du mir eins?',
        choices: [
          { label: 'Mach ich!', then: 'weiter' },
          { label: 'Gerade nicht', then: 'spaeter' },
        ],
      },
      { speaker: 'rosie', text: 'Danke! Seerosenblätter schwimmen hier im Teich, und eine Wiesenblüte macht es schön weich.' },
    ],
    effects: [{ startQuest: Q_KISSEN }, { learnRecipe: R_KISSEN }],
  },
  {
    id: 'dlg.rosie.danke',
    character: 'rosie',
    when: { all: [{ questStep: { quest: Q_KISSEN, step: 'bringen' } }, { hasItems: { 'item.seerosenkissen': 1 } }] },
    lines: [
      { speaker: 'rosie', text: 'Das Kissen! Ist das für mich?' },
      { speaker: null, text: 'Rosie kuschelt sich hinein. Bubbles dreht eine Runde und blubbert vor Freude.' },
      { speaker: 'bubbles', text: 'Blubb blubb! Die sind für dich – haben wir am Teichgrund gefunden.' },
    ],
    effects: [{ takeItems: { 'item.seerosenkissen': 1 } }, { giveItems: { 'item.glitzerkiesel': 2 } }],
  },
  {
    id: 'dlg.rosie.bringen',
    character: 'rosie',
    when: { questStep: { quest: Q_KISSEN, step: 'bringen' } },
    lines: [
      { speaker: 'rosie', text: 'Hast du das Kissen dabei? Wenn es schon irgendwo liegt, kannst du es im Beutel wieder einpacken.' },
    ],
  },
  {
    id: 'dlg.rosie.sammeln',
    character: 'rosie',
    when: { questStep: { quest: Q_KISSEN, step: 'sammeln' } },
    lines: [{ speaker: 'rosie', text: 'Seerosenblätter schwimmen hier im Teich. Wiesenblüten findest du drüben auf der Wiese.' }],
  },
  {
    id: 'dlg.rosie.basteln',
    character: 'rosie',
    when: { questStep: { quest: Q_KISSEN, step: 'basteln' } },
    lines: [{ speaker: 'rosie', text: 'Am Bastelstumpf geht das ganz leicht!' }],
  },
  {
    id: 'dlg.rosie.plaudern',
    character: 'rosie',
    when: { questDone: Q_KISSEN },
    lines: [{ speaker: 'rosie', text: 'So gemütlich! Danke noch mal, {name}.' }],
  },
  {
    id: 'dlg.rosie.fremd',
    character: 'rosie',
    lines: [{ speaker: 'rosie', text: 'Oh, hallo! Wir kennen uns ja noch gar nicht. Komm doch bald mal wieder vorbei!' }],
  },
  {
    id: 'dlg.bubbles.blubb',
    character: 'bubbles',
    lines: [
      { speaker: 'bubbles', text: 'Blubb!' },
      { speaker: null, text: 'Bubbles dreht sich einmal im Kreis. Eine Blase steigt auf und macht leise plopp.' },
    ],
  },

  // ---- Kapitel Zoo (Vorschlag): Meerkat ----
  {
    id: 'dlg.meerkat.hallo',
    character: 'meerkat',
    when: { all: [{ questDone: Q_KISSEN }, { questNotStarted: Q_WIMPEL }] },
    lines: [
      { speaker: 'meerkat', text: 'Halt! Wer da? … Ach, eine Otter! Hallo, ich bin Meerkat.' },
      { speaker: 'meerkat', text: 'Ich halte hier Wache. Den ganzen Tag! Von meinem Stein aus sehe ich alles.' },
      {
        speaker: 'meerkat',
        text: 'Nur finden mich meine Freunde nie, wenn ich mich ducke. Ein Wimpel auf dem Stein wäre perfekt. Bastelst du mir einen?',
        choices: [
          { label: 'Klar!', then: 'weiter' },
          { label: 'Später', then: 'spaeter' },
        ],
      },
      { speaker: 'meerkat', text: 'Super! Zwei Federn und ein Stück Treibholz. Federn liegen hier im Zoo herum, Treibholz gibt es am Ufer.' },
    ],
    effects: [{ startQuest: Q_WIMPEL }, { learnRecipe: R_WIMPEL }],
  },
  {
    id: 'dlg.meerkat.danke',
    character: 'meerkat',
    when: { all: [{ questStep: { quest: Q_WIMPEL, step: 'bringen' } }, { hasItems: { 'item.federwimpel': 1 } }] },
    lines: [
      { speaker: 'meerkat', text: 'Ist das … mein Wimpel? Wie schön!' },
      { speaker: null, text: 'Meerkat steckt den Wimpel oben auf den Aussichtsstein und stellt sich stolz daneben.' },
      { speaker: 'meerkat', text: 'Jetzt findet mich jeder. Hier, die habe ich beim Wachehalten gesammelt – Sonnenblumenkerne!' },
      { speaker: 'meerkat', text: 'Mit einer Muschel als Topf wächst daraus eine kleine Sonnenblume.' },
    ],
    effects: [{ takeItems: { 'item.federwimpel': 1 } }, { giveItems: { 'item.sonnenblumenkern': 2 } }],
  },
  {
    id: 'dlg.meerkat.bringen',
    character: 'meerkat',
    when: { questStep: { quest: Q_WIMPEL, step: 'bringen' } },
    lines: [{ speaker: 'meerkat', text: 'Hast du den Wimpel? Wenn er schon irgendwo steht, kannst du ihn im Beutel wieder einpacken.' }],
  },
  {
    id: 'dlg.meerkat.sammeln',
    character: 'meerkat',
    when: { questStep: { quest: Q_WIMPEL, step: 'sammeln' } },
    lines: [{ speaker: 'meerkat', text: 'Federn liegen überall im Zoo. Treibholz findest du am Ufer oder in der Schilfbucht.' }],
  },
  {
    id: 'dlg.meerkat.basteln',
    character: 'meerkat',
    when: { questStep: { quest: Q_WIMPEL, step: 'basteln' } },
    lines: [{ speaker: 'meerkat', text: 'Die Werkbank steht unten im Zoo. Ich pass so lange auf!' }],
  },
  {
    id: 'dlg.meerkat.plaudern',
    character: 'meerkat',
    when: { questDone: Q_WIMPEL },
    lines: [{ speaker: 'meerkat', text: 'Alles ruhig, {name}! Ich halte weiter Wache – mit Wimpel.' }],
  },
  {
    id: 'dlg.meerkat.fremd',
    character: 'meerkat',
    lines: [{ speaker: 'meerkat', text: 'Halt! Wer da? … Ach so. Ich bin gerade sehr beschäftigt mit Wachehalten.' }],
  },

  // ---- Kapitel Zoo (Vorschlag): Squichy ----
  {
    id: 'dlg.squichy.hallo',
    character: 'squichy',
    when: { all: [{ questDone: Q_WIMPEL }, { questNotStarted: Q_BALL }] },
    lines: [
      { speaker: 'squichy', text: 'Huiii, Besuch! Hallo! Ich bin Squichy!' },
      { speaker: 'squichy', text: 'Ich bin die Kleinste hier. Die Großen spielen immer mit Bällen, aber ich hab gar keinen.' },
      {
        speaker: 'squichy',
        text: 'Kannst du mir einen basteln? Einen, der beim Rollen raschelt?',
        choices: [
          { label: 'Mach ich!', then: 'weiter' },
          { label: 'Gerade nicht', then: 'spaeter' },
        ],
      },
      { speaker: 'squichy', text: 'Juhu! Aus zwei Schilfhalmen und einem Glitzerkiesel geht das. Schilf wächst in der Bucht beim Startufer.' },
    ],
    effects: [{ startQuest: Q_BALL }, { learnRecipe: R_BALL }],
  },
  {
    id: 'dlg.squichy.danke',
    character: 'squichy',
    when: { all: [{ questStep: { quest: Q_BALL, step: 'bringen' } }, { hasItems: { 'item.schilfball': 1 } }] },
    lines: [
      { speaker: 'squichy', text: 'Ein Ball! Für mich?' },
      { speaker: null, text: 'Squichy stupst den Schilfball mit der Nase hoch und balanciert ihn eine ganze Weile.' },
      { speaker: 'squichy', text: 'Danke! Die hier hab ich am Beckenrand gefunden – für dich!' },
    ],
    effects: [{ takeItems: { 'item.schilfball': 1 } }, { giveItems: { 'item.muschelschale': 2 } }],
  },
  {
    id: 'dlg.squichy.bringen',
    character: 'squichy',
    when: { questStep: { quest: Q_BALL, step: 'bringen' } },
    lines: [{ speaker: 'squichy', text: 'Ist der Ball fertig? Wenn er schon irgendwo liegt, pack ihn im Beutel wieder ein!' }],
  },
  {
    id: 'dlg.squichy.sammeln',
    character: 'squichy',
    when: { questStep: { quest: Q_BALL, step: 'sammeln' } },
    lines: [{ speaker: 'squichy', text: 'Schilf wächst in der Bucht beim Startufer. Glitzerkiesel liegen am Tiramisu Stream!' }],
  },
  {
    id: 'dlg.squichy.basteln',
    character: 'squichy',
    when: { questStep: { quest: Q_BALL, step: 'basteln' } },
    lines: [{ speaker: 'squichy', text: 'Die Werkbank ist unten im Zoo. Ich warte hier und übe schon mal Nase hoch!' }],
  },
  {
    id: 'dlg.squichy.plaudern',
    character: 'squichy',
    when: { questDone: Q_BALL },
    lines: [{ speaker: 'squichy', text: 'Guck mal, {name}: Nase hoch, Ball drauf! Huiii!' }],
  },
  {
    id: 'dlg.squichy.fremd',
    character: 'squichy',
    lines: [{ speaker: 'squichy', text: 'Huiii! Hallo! Ich schwimm gerade Kreise. Komm doch bald mal wieder!' }],
  },
];

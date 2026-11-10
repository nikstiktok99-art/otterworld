// Inhaltspaket „Vertrauen“ (Vorschlag): Pro Freund eine kleine Herzensbitte. Danach ist er im Freundebuch spielbar.
// Alle Bitten nutzen Rezepte, die sie bis dahin schon kennt – so greifen die Orte ineinander.
// ENTWURF: Alle Texte sind Vorschläge und dürfen frei ersetzt werden.
import type { Condition, DialogueDef, ItemDef, MomentDef, QuestDef, RecipeDef } from './types';
import {
  Q_BALL,
  Q_FARBEN,
  Q_FESTESSEN,
  Q_KISSEN,
  Q_KLETTER,
  Q_KRANZ,
  Q_NICKERCHEN,
  Q_SONNENBLUME,
  Q_SUPPE,
  Q_TEICHLICHT,
  Q_WALDLICHT,
  Q_WIMPEL,
  R_TEICHLATERNE,
} from './ids';

export const vertrauenItems: Record<string, ItemDef> = {
  'item.teichlaterne': {
    id: 'item.teichlaterne',
    name: 'Teichlaterne',
    plural: 'Teichlaternen',
    kind: 'deco',
    description: 'Ein Kiesellicht auf einem Seerosenblatt. Antippen schaltet es an und aus.',
    sprite: 'deco.teichlaterne.aus',
    deco: { spriteOn: 'deco.teichlaterne.an', glow: { x: 0, y: -8, scale: 1 } },
  },
};

export const vertrauenRecipes: Record<string, RecipeDef> = {
  [R_TEICHLATERNE]: {
    id: R_TEICHLATERNE,
    name: 'Teichlaterne',
    inputs: { 'item.kiesellicht': 1, 'item.seerosenblatt': 2 },
    output: { item: 'item.teichlaterne', count: 1 },
  },
};

/** Eine Bitte nach dem immer gleichen Muster: besorgen, bringen, Vertrauen. */
function bitte(o: {
  id: string;
  name: string;
  giver: string;
  after: string;
  offerHint: string;
  item: string;
  besorgenHint: string;
  bringenHint: string;
  danke: string;
  moments: string[];
  unlock: string[];
  ending: { title: string; text: string };
}): QuestDef {
  return {
    id: o.id,
    name: o.name,
    giver: o.giver,
    offer: { when: { questDone: o.after }, hint: o.offerHint },
    steps: [
      { id: 'besorgen', hint: o.besorgenHint, completeWhen: { hasItems: { [o.item]: 1 } } },
      {
        id: 'bringen',
        hint: o.bringenHint,
        completeWhen: { dialogue: o.danke },
        onComplete: [...o.moments.map((m) => ({ addMoment: m })), ...o.unlock.map((c) => ({ unlockCharacter: c }))],
      },
    ],
    ending: o.ending,
  };
}

export const vertrauenQuests: Record<string, QuestDef> = {
  [Q_TEICHLICHT]: bitte({
    id: Q_TEICHLICHT,
    name: 'Ein Licht für den Teich',
    giver: 'rosie',
    after: Q_KISSEN,
    offerHint: 'Rosie und Bubbles haben eine Bitte – im Teich am Tiramisu Stream',
    item: 'item.teichlaterne',
    besorgenHint: 'Teichlaterne basteln: ein Kiesellicht und zwei Seerosenblätter',
    bringenHint: 'Bring Rosie und Bubbles die Teichlaterne',
    danke: 'dlg.rosie.teichlicht.danke',
    moments: ['moment.rosie.teichlicht', 'moment.bubbles.teichlicht'],
    unlock: ['rosie', 'bubbles'],
    ending: {
      title: 'Ein Licht für den Teich',
      text: 'Auf einem Seerosenblatt leuchtet jetzt deine Teichlaterne, und die Blasen von Bubbles glitzern darin. Rosie und Bubbles vertrauen dir.',
    },
  }),
  [Q_SONNENBLUME]: bitte({
    id: Q_SONNENBLUME,
    name: 'Eine Sonnenblume für Meerkat',
    giver: 'meerkat',
    after: Q_WIMPEL,
    offerHint: 'Meerkat möchte dir etwas zeigen – im Zoo',
    item: 'item.sonnenblumentopf',
    besorgenHint: 'Sonnenblumentopf basteln: zwei Sonnenblumenkerne und eine Muschelschale',
    bringenHint: 'Bring Meerkat den Sonnenblumentopf',
    danke: 'dlg.meerkat.sonnenblume.danke',
    moments: ['moment.meerkat.sonnenblume'],
    unlock: ['meerkat'],
    ending: { title: 'Eine Sonnenblume für Meerkat', text: 'Neben dem Aussichtsstein hält jetzt eine Sonnenblume mit Wache. Meerkat vertraut dir.' },
  }),
  [Q_NICKERCHEN]: bitte({
    id: Q_NICKERCHEN,
    name: 'Ein Nickerchen für Squichy',
    giver: 'squichy',
    after: Q_BALL,
    offerHint: 'Squichy ist müde vom Spielen – im Zoo',
    item: 'item.seerosenkissen',
    besorgenHint: 'Seerosenkissen basteln: zwei Seerosenblätter und eine Wiesenblüte',
    bringenHint: 'Bring Squichy das Seerosenkissen',
    danke: 'dlg.squichy.nickerchen.danke',
    moments: ['moment.squichy.nickerchen'],
    unlock: ['squichy'],
    ending: { title: 'Ein Nickerchen für Squichy', text: 'Squichy schläft zusammengerollt auf dem Seerosenkissen und schnarcht ganz leise. Squichy vertraut dir.' },
  }),
  [Q_FARBEN]: bitte({
    id: Q_FARBEN,
    name: 'Farben für Chamaron',
    giver: 'chamaron',
    after: Q_KLETTER,
    offerHint: 'Chamaron möchte neue Farben ausprobieren – im Cat Café',
    item: 'item.bluetengirlande',
    besorgenHint: 'Blütengirlande basteln: drei Wiesenblüten und ein Glitzerkiesel',
    bringenHint: 'Bring Chamaron die Blütengirlande',
    danke: 'dlg.chamaron.farben.danke',
    moments: ['moment.chamaron.farben'],
    unlock: ['chamaron'],
    ending: { title: 'Farben für Chamaron', text: 'Chamaron leuchtet abwechselnd rosa, gelb und lila – ganz ohne sich zu verstecken. Chamaron vertraut dir.' },
  }),
  [Q_SUPPE]: bitte({
    id: Q_SUPPE,
    name: 'Suppe für alle',
    giver: 'beano',
    after: Q_FESTESSEN,
    offerHint: 'Die Erbsen haben schon wieder Hunger – im Hotpot-Restaurant',
    item: 'item.kraeutersuppe',
    besorgenHint: 'Kräutersuppe kochen: Kräuter, ein Möhrchen und eine Muschelschale – am Kochtopf',
    bringenHint: 'Bring den Erbsen die Kräutersuppe',
    danke: 'dlg.beano.suppe.danke',
    moments: ['moment.beano.suppe', 'moment.beani.suppe', 'moment.beanz.suppe'],
    unlock: ['beano', 'beani', 'beanz'],
    ending: { title: 'Suppe für alle', text: 'Drei kleine Erbsen löffeln aus einer Muschelschale und kichern dabei. Sie vertrauen dir – alle drei.' },
  }),
  [Q_WALDLICHT]: bitte({
    id: Q_WALDLICHT,
    name: 'Ein Licht im Wald',
    giver: 'bean',
    after: Q_KRANZ,
    offerHint: 'Bean wartet im Wald auf dich',
    item: 'item.beerenlicht',
    besorgenHint: 'Beerenlicht basteln: zwei Waldbeeren und ein Glitzerkiesel',
    bringenHint: 'Bring Bean das Beerenlicht',
    danke: 'dlg.bean.waldlicht.danke',
    moments: ['moment.bean.waldlicht'],
    unlock: ['bean'],
    ending: { title: 'Ein Licht im Wald', text: 'Auf der Lichtung leuchtet jetzt dein Beerenlicht, und Bean schaut lange hinein. Bean vertraut dir.' },
  }),
};

export const vertrauenMoments: Record<string, MomentDef> = {
  'moment.rosie.teichlicht': {
    id: 'moment.rosie.teichlicht',
    character: 'rosie',
    title: 'Ein Licht für den Teich',
    text: 'Auf einem Seerosenblatt leuchtet jetzt deine Teichlaterne.',
  },
  'moment.bubbles.teichlicht': {
    id: 'moment.bubbles.teichlicht',
    character: 'bubbles',
    title: 'Blasen im Laternenlicht',
    text: 'Seit der Teichlaterne kann Bubbles seine Blasen auch nachts sehen.',
  },
  'moment.meerkat.sonnenblume': {
    id: 'moment.meerkat.sonnenblume',
    character: 'meerkat',
    title: 'Wache mit Sonnenblume',
    text: 'Neben Meerkats Stein steht jetzt eine Sonnenblume, die mit Wache hält.',
  },
  'moment.squichy.nickerchen': {
    id: 'moment.squichy.nickerchen',
    character: 'squichy',
    title: 'Ein Nickerchen für Squichy',
    text: 'Squichy schläft jetzt auf einem weichen Seerosenkissen am Beckenrand.',
  },
  'moment.chamaron.farben': {
    id: 'moment.chamaron.farben',
    character: 'chamaron',
    title: 'Farben für Chamaron',
    text: 'Mit deiner Blütengirlande hat Chamaron ganz neue Farben ausprobiert.',
  },
  'moment.beano.suppe': { id: 'moment.beano.suppe', character: 'beano', title: 'Suppe für alle', text: 'Beano hat die Suppe als Erste probiert und laut „lecker!“ gerufen.' },
  'moment.beani.suppe': { id: 'moment.beani.suppe', character: 'beani', title: 'Suppe für alle', text: 'Beani hat ganz leise gepustet, bis die Suppe nicht mehr zu heiß war.' },
  'moment.beanz.suppe': { id: 'moment.beanz.suppe', character: 'beanz', title: 'Suppe für alle', text: 'Beanz wollte wissen, warum Suppe dampft – und hat es dir dann selbst erklärt.' },
  'moment.bean.waldlicht': {
    id: 'moment.bean.waldlicht',
    character: 'bean',
    title: 'Ein Licht im Wald',
    text: 'Auf Beans Lichtung leuchtet jetzt dein Beerenlicht.',
  },
};

const offen = (after: string, quest: string): Condition => ({ all: [{ questDone: after }, { questNotStarted: quest }] });
const schritt = (quest: string, step: string): Condition => ({ questStep: { quest, step } });
const mitItem = (quest: string, item: string): Condition => ({ all: [schritt(quest, 'bringen'), { hasItems: { [item]: 1 } }] });

// Diese Gespräche stehen vor den übrigen: Ihre Bedingungen greifen erst nach der ersten Aufgabe des Freundes.
export const vertrauenDialogues: DialogueDef[] = [
  // ---- Rosie und Bubbles ----
  {
    id: 'dlg.rosie.teichlicht',
    character: 'rosie',
    when: offen(Q_KISSEN, Q_TEICHLICHT),
    lines: [
      { speaker: 'rosie', text: 'Weißt du, {name}, nachts ist es im Teich ganz schön dunkel.' },
      { speaker: 'bubbles', text: 'Blubb. Dann sehe ich meine eigenen Blasen nicht!' },
      {
        speaker: 'rosie',
        text: 'Eine kleine Laterne auf einem Seerosenblatt … das wäre wunderschön. Bastelst du uns eine?',
        choices: [
          { label: 'Für euch gern!', then: 'weiter' },
          { label: 'Später', then: 'spaeter' },
        ],
      },
      { speaker: 'rosie', text: 'Ein Kiesellicht und zwei Seerosenblätter. Lumi hat dir doch gezeigt, wie Kiesel leuchten!' },
    ],
    effects: [{ startQuest: Q_TEICHLICHT }, { learnRecipe: R_TEICHLATERNE }],
  },
  {
    id: 'dlg.rosie.teichlicht.danke',
    character: 'rosie',
    when: mitItem(Q_TEICHLICHT, 'item.teichlaterne'),
    lines: [
      { speaker: 'rosie', text: 'Oh! Sie leuchtet ja schon!' },
      { speaker: null, text: 'Rosie setzt die Laterne vorsichtig auf ein Seerosenblatt. Bubbles pustet Blasen drumherum, und alle glitzern im Licht.' },
      { speaker: 'bubbles', text: 'Blubb blubb! Jetzt sehe ich meine Blasen sogar nachts!' },
      { speaker: 'rosie', text: 'Danke, {name}. Wenn du magst, schwimm doch mal als eine von uns durch den Teich – schau ins Freundebuch.' },
    ],
    effects: [{ takeItems: { 'item.teichlaterne': 1 } }],
  },
  {
    id: 'dlg.rosie.teichlicht.erinnerung',
    character: 'rosie',
    when: { any: [schritt(Q_TEICHLICHT, 'besorgen'), schritt(Q_TEICHLICHT, 'bringen')] },
    lines: [
      { speaker: 'rosie', text: 'Ein Kiesellicht und zwei Seerosenblätter – am Bastelstumpf geht das ganz leicht.' },
      { speaker: 'bubbles', text: 'Und wenn die Laterne schon irgendwo steht: im Beutel wieder einpacken! Blubb.' },
    ],
  },
  {
    id: 'dlg.rosie.vertraut',
    character: 'rosie',
    when: { questDone: Q_TEICHLICHT },
    lines: [{ speaker: 'rosie', text: 'Unser Teich ist jetzt der gemütlichste von allen. Danke, {name}.' }],
  },

  // ---- Meerkat ----
  {
    id: 'dlg.meerkat.sonnenblume',
    character: 'meerkat',
    when: offen(Q_WIMPEL, Q_SONNENBLUME),
    lines: [
      { speaker: 'meerkat', text: 'Psst, {name}! Von meinem Stein sehe ich alles – nur keine Blumen. Hier ist alles Sand.' },
      {
        speaker: 'meerkat',
        text: 'Eine Sonnenblume neben dem Stein wäre toll. Die schaut auch immer in die gleiche Richtung wie ich!',
        choices: [
          { label: 'Ich bring dir eine!', then: 'weiter' },
          { label: 'Später', then: 'spaeter' },
        ],
      },
      { speaker: 'meerkat', text: 'Zwei Sonnenblumenkerne und eine Muschel als Topf. Die Kerne hast du ja schon von mir!' },
    ],
    effects: [{ startQuest: Q_SONNENBLUME }],
  },
  {
    id: 'dlg.meerkat.sonnenblume.danke',
    character: 'meerkat',
    when: mitItem(Q_SONNENBLUME, 'item.sonnenblumentopf'),
    lines: [
      { speaker: 'meerkat', text: 'Eine echte Sonnenblume! Für meinen Wachposten!' },
      { speaker: null, text: 'Meerkat stellt den Topf neben den Stein und streckt sich genauso hoch wie die Blume.' },
      { speaker: 'meerkat', text: 'Weißt du was? Du darfst auch mal Wache halten. Als ich! Schau ins Freundebuch.' },
    ],
    effects: [{ takeItems: { 'item.sonnenblumentopf': 1 } }],
  },
  {
    id: 'dlg.meerkat.sonnenblume.erinnerung',
    character: 'meerkat',
    when: { any: [schritt(Q_SONNENBLUME, 'besorgen'), schritt(Q_SONNENBLUME, 'bringen')] },
    lines: [{ speaker: 'meerkat', text: 'Zwei Kerne, eine Muschel, ab an die Werkbank! Und falls der Topf schon steht: im Beutel einpacken.' }],
  },
  {
    id: 'dlg.meerkat.vertraut',
    character: 'meerkat',
    when: { questDone: Q_SONNENBLUME },
    lines: [{ speaker: 'meerkat', text: 'Alles ruhig, {name}! Die Sonnenblume und ich haben alles im Blick.' }],
  },

  // ---- Squichy ----
  {
    id: 'dlg.squichy.nickerchen',
    character: 'squichy',
    when: offen(Q_BALL, Q_NICKERCHEN),
    lines: [
      { speaker: 'squichy', text: 'Huiii … gähn. Ballspielen macht ganz schön müde.' },
      {
        speaker: 'squichy',
        text: 'Am Beckenrand ist es so hart. Mit einem weichen Kissen könnte ich da ein Nickerchen machen.',
        choices: [
          { label: 'Ich bastel dir eins!', then: 'weiter' },
          { label: 'Später', then: 'spaeter' },
        ],
      },
      { speaker: 'squichy', text: 'Ein Seerosenkissen wär perfekt! So eins, wie Rosie hat.' },
    ],
    effects: [{ startQuest: Q_NICKERCHEN }],
  },
  {
    id: 'dlg.squichy.nickerchen.danke',
    character: 'squichy',
    when: mitItem(Q_NICKERCHEN, 'item.seerosenkissen'),
    lines: [
      { speaker: 'squichy', text: 'Das ist ja so weich!' },
      { speaker: null, text: 'Squichy robbt aufs Kissen, rollt sich zusammen und ist schon fast eingeschlafen.' },
      { speaker: 'squichy', text: 'Danke, {name} … du darfst auch mal … ich sein … im Freundebuch … zzz.' },
    ],
    effects: [{ takeItems: { 'item.seerosenkissen': 1 } }],
  },
  {
    id: 'dlg.squichy.nickerchen.erinnerung',
    character: 'squichy',
    when: { any: [schritt(Q_NICKERCHEN, 'besorgen'), schritt(Q_NICKERCHEN, 'bringen')] },
    lines: [{ speaker: 'squichy', text: 'Seerosenblätter gibt es im Teich am Tiramisu Stream … gähn.' }],
  },
  {
    id: 'dlg.squichy.vertraut',
    character: 'squichy',
    when: { questDone: Q_NICKERCHEN },
    lines: [{ speaker: 'squichy', text: 'Huiii, {name}! Ausgeschlafen und bereit zum Spielen!' }],
  },

  // ---- Chamaron ----
  {
    id: 'dlg.chamaron.farben',
    character: 'chamaron',
    when: offen(Q_KLETTER, Q_FARBEN),
    lines: [
      { speaker: 'chamaron', text: 'Ich kann so viele Farben … aber hier im Café ist alles braun und grün.' },
      {
        speaker: 'chamaron',
        text: 'Eine Blütengirlande mit ganz vielen Farben – dann kann ich üben!',
        choices: [
          { label: 'Ich bring dir eine!', then: 'weiter' },
          { label: 'Später', then: 'spaeter' },
        ],
      },
      { speaker: 'chamaron', text: 'Wie die von Lumi! Drei Wiesenblüten und ein Glitzerkiesel.' },
    ],
    effects: [{ startQuest: Q_FARBEN }],
  },
  {
    id: 'dlg.chamaron.farben.danke',
    character: 'chamaron',
    when: mitItem(Q_FARBEN, 'item.bluetengirlande'),
    lines: [
      { speaker: 'chamaron', text: 'So viele Farben!' },
      { speaker: null, text: 'Chamaron hält sich neben jede Blüte und färbt sich nacheinander rosa, gelb und lila.' },
      { speaker: 'chamaron', text: 'Schau, {name}! Und wenn du magst, darfst du auch mal so bunt sein wie ich. Im Freundebuch!' },
    ],
    effects: [{ takeItems: { 'item.bluetengirlande': 1 } }],
  },
  {
    id: 'dlg.chamaron.farben.erinnerung',
    character: 'chamaron',
    when: { any: [schritt(Q_FARBEN, 'besorgen'), schritt(Q_FARBEN, 'bringen')] },
    lines: [{ speaker: 'chamaron', text: 'Wiesenblüten wachsen am Tiramisu Stream. Ich warte hier. Ganz unauffällig.' }],
  },
  {
    id: 'dlg.chamaron.vertraut',
    character: 'chamaron',
    when: { questDone: Q_FARBEN },
    lines: [{ speaker: 'chamaron', text: 'Heute bin ich … himmelblau! Gefällt es dir, {name}?' }],
  },

  // ---- Beano, Beani und Beanz ----
  {
    id: 'dlg.beano.suppe',
    character: 'beano',
    when: offen(Q_FESTESSEN, Q_SUPPE),
    lines: [
      { speaker: 'beano', text: 'Wir haben schon wieder Hunger!' },
      { speaker: 'beanz', text: 'Was gibt es heute? Suppe? Gibt es Suppe?' },
      {
        speaker: 'beani',
        text: 'Eine warme Kräutersuppe … das wäre schön …',
        choices: [
          { label: 'Ich koche Suppe!', then: 'weiter' },
          { label: 'Später', then: 'spaeter' },
        ],
      },
      { speaker: 'beano', text: 'Juhu! Kräuter, ein Möhrchen und eine Muschel als Schale. Ab an den Kochtopf!' },
    ],
    effects: [{ startQuest: Q_SUPPE }],
  },
  {
    id: 'dlg.beano.suppe.danke',
    character: 'beano',
    when: mitItem(Q_SUPPE, 'item.kraeutersuppe'),
    lines: [
      { speaker: 'beano', text: 'Suppe!' },
      { speaker: 'beani', text: 'Sie ist so schön warm …' },
      { speaker: null, text: 'Die drei Erbsen löffeln gemeinsam aus der Muschelschale und kichern dabei.' },
      { speaker: 'beanz', text: 'Weißt du was? Du darfst auch mal mit uns in der Schale sitzen! Und dir aussuchen, wer von uns spricht!' },
    ],
    effects: [{ takeItems: { 'item.kraeutersuppe': 1 } }],
  },
  {
    id: 'dlg.beano.suppe.erinnerung',
    character: 'beano',
    when: { any: [schritt(Q_SUPPE, 'besorgen'), schritt(Q_SUPPE, 'bringen')] },
    lines: [
      { speaker: 'beanz', text: 'Kräuter stehen am Fenster, Möhrchen in der Kiste. Und Muscheln? Am Strand!' },
      { speaker: 'beani', text: '… wir warten … ganz geduldig …' },
    ],
  },
  {
    id: 'dlg.beano.vertraut',
    character: 'beano',
    when: { questDone: Q_SUPPE },
    lines: [
      { speaker: 'beano', text: 'Unsere Lieblingsköchin!' },
      { speaker: 'beanz', text: 'Was kochen wir als Nächstes? Und warum?' },
    ],
  },

  // ---- Bean ----
  {
    id: 'dlg.bean.waldlicht',
    character: 'bean',
    when: offen(Q_KRANZ, Q_WALDLICHT),
    lines: [
      { speaker: 'bean', text: 'Abends wird es im Wald sehr dunkel, {name}. Die Füchse finden das gemütlich. Ich nicht so.' },
      {
        speaker: 'bean',
        text: 'Ein kleines Beerenlicht auf der Lichtung … dann wäre es perfekt.',
        choices: [
          { label: 'Ich bring dir eins.', then: 'weiter' },
          { label: 'Später', then: 'spaeter' },
        ],
      },
      { speaker: 'bean', text: 'Zwei Waldbeeren und ein Glitzerkiesel. Danke, dass du fragst.' },
    ],
    effects: [{ startQuest: Q_WALDLICHT }],
  },
  {
    id: 'dlg.bean.waldlicht.danke',
    character: 'bean',
    when: mitItem(Q_WALDLICHT, 'item.beerenlicht'),
    lines: [
      { speaker: 'bean', text: 'Wie warm es leuchtet.' },
      { speaker: null, text: 'Bean stellt das Beerenlicht neben den Baumstumpf und schaut lange hinein.' },
      { speaker: 'bean', text: 'Ich glaube, wir sind jetzt richtig gute Freunde. Wenn du magst, lauf doch mal als ich durch den Wald.' },
    ],
    effects: [{ takeItems: { 'item.beerenlicht': 1 } }],
  },
  {
    id: 'dlg.bean.waldlicht.erinnerung',
    character: 'bean',
    when: { any: [schritt(Q_WALDLICHT, 'besorgen'), schritt(Q_WALDLICHT, 'bringen')] },
    lines: [{ speaker: 'bean', text: 'Waldbeeren wachsen an den Sträuchern, Glitzerkiesel am Bach. Ganz ohne Eile.' }],
  },
  {
    id: 'dlg.bean.vertraut',
    character: 'bean',
    when: { questDone: Q_WALDLICHT },
    lines: [{ speaker: 'bean', text: 'Schön, dass du da bist, {name}. Das Licht leuchtet jeden Abend.' }],
  },
];

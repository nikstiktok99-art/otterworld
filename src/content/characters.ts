import type { BodyDef, CharacterDef } from './types';
import { Q_BALL, Q_FESTESSEN, Q_KISSEN, Q_KLETTER, Q_KRANZ, Q_LICHT, Q_PICKNICK, Q_WIMPEL } from './ids';

// Figuren-ID, Weltkörper-ID und Grafikschlüssel sind bewusst getrennt.
// Weitere Figuren aus dem Kanon (Chamaron, Meerkat, Bean, Erbsentrio, Squichy) kommen hinzu, sobald ihre Kapitel
// gebaut werden – siehe docs/WELTPLAN.md und docs/INHALTSPLAN.md.
// ENTWURF: Die Texte im Freundebuch („about“) sind Vorschläge und bleiben bei den Fakten aus dem Masterprompt.

export const characters: Record<string, CharacterDef> = {
  otter: {
    id: 'otter',
    // Der Starter-Otter heißt so, wie die Spielerin sich im ersten Gespräch nennt.
    name: { fromPlayer: true, fallback: 'Otter' },
    body: 'body.otter',
    portrait: 'portraits.otter',
  },
  schnabbi: {
    id: 'schnabbi',
    name: 'Schnabbi',
    body: 'body.schnabbi',
    portrait: 'portraits.schnabbi',
    friend: { about: 'Dein erster Freund am Ufer. Er wohnt gleich am Steg.', metWhen: { not: { questNotStarted: Q_LICHT } } },
  },
  // Kanon: Otterprinzessin mit Kleid und Krone, „Lumi“ ist ein möglicher Name. Ihre Begegnung folgt nach Schnabbi.
  otterprinzessin: {
    id: 'otterprinzessin',
    name: 'Lumi',
    body: 'body.otterprinzessin',
    portrait: 'portraits.otterprinzessin',
    friend: { about: 'Eine Otter mit Kleid und Krone. Sie wohnt am Tiramisu Stream.', metWhen: { not: { questNotStarted: Q_PICKNICK } } },
  },
  // Kanon: Rosie ist ein pinker Axolotl, Schwester von Bubbles.
  rosie: {
    id: 'rosie',
    name: 'Rosie',
    body: 'body.rosie',
    portrait: 'portraits.rosie',
    friend: { about: 'Ein pinker Axolotl, Schwester von Bubbles. Lebt im Teich am Tiramisu Stream.', metWhen: { not: { questNotStarted: Q_KISSEN } } },
  },
  // Kanon: Bubbles ist ein blauer Axolotl, Bruder von Rosie, macht immer wieder Blasen.
  bubbles: {
    id: 'bubbles',
    name: 'Bubbles',
    body: 'body.bubbles',
    portrait: 'portraits.bubbles',
    friend: {
      about: 'Ein blauer Axolotl, Bruder von Rosie. Macht immer wieder Blasen, auch beim gemütlichen Herumschwimmen.',
      metWhen: { not: { questNotStarted: Q_KISSEN } },
    },
  },
  // Kanon: Erdmännchen, „Meerkat“ ist der Name.
  meerkat: {
    id: 'meerkat',
    name: 'Meerkat',
    body: 'body.meerkat',
    portrait: 'portraits.meerkat',
    friend: { about: 'Ein Erdmännchen, das im Zoo auf einem Stein Wache hält.', metWhen: { not: { questNotStarted: Q_WIMPEL } } },
  },
  // Kanon: eine Mini-Robbe, Schreibweise „Squichy“.
  squichy: {
    id: 'squichy',
    name: 'Squichy',
    body: 'body.squichy',
    portrait: 'portraits.squichy',
    friend: { about: 'Eine Mini-Robbe, die Kleinste im Becken des Zoos.', metWhen: { not: { questNotStarted: Q_BALL } } },
  },
  // Kanon: Chamäleon, Schreibweise „Chamaron“.
  chamaron: {
    id: 'chamaron',
    name: 'Chamaron',
    body: 'body.chamaron',
    portrait: 'portraits.chamaron',
    friend: {
      about: 'Ein Chamäleon im Cat Café. Versteckt sich gern zwischen den Pflanzen und wechselt die Farbe, wenn es sich wohlfühlt.',
      metWhen: { not: { questNotStarted: Q_KLETTER } },
    },
  },
  // Kanon: Beano, Beani und Beanz – drei eigenständige Erbsen, immer gemeinsam in einer Schale.
  // Stimmen (Vorschlag): Beano fröhlich und laut, Beani sanft und verträumt, Beanz neugierig und voller Fragen.
  beano: {
    id: 'beano',
    name: 'Beano',
    body: 'body.erbsenschale',
    seat: 0,
    portrait: 'portraits.beano',
    friend: { about: 'Die fröhlichste der drei Erbsen. Wohnt mit Beani und Beanz in einer Schale.', metWhen: { not: { questNotStarted: Q_FESTESSEN } } },
  },
  beani: {
    id: 'beani',
    name: 'Beani',
    body: 'body.erbsenschale',
    seat: 1,
    portrait: 'portraits.beani',
    friend: { about: 'Die sanfte, verträumte Erbse. Wohnt mit Beano und Beanz in einer Schale.', metWhen: { not: { questNotStarted: Q_FESTESSEN } } },
  },
  beanz: {
    id: 'beanz',
    name: 'Beanz',
    body: 'body.erbsenschale',
    seat: 2,
    portrait: 'portraits.beanz',
    friend: { about: 'Die neugierigste der drei Erbsen – hat immer eine Frage. Wohnt mit Beano und Beani in einer Schale.', metWhen: { not: { questNotStarted: Q_FESTESSEN } } },
  },
  // Kanon: Bean ist ein Rentier, unabhängig vom Erbsentrio.
  bean: {
    id: 'bean',
    name: 'Bean',
    body: 'body.bean',
    portrait: 'portraits.bean',
    friend: { about: 'Ein Rentier, das im Wald beim Fuchsbau wohnt. Ruhig und freundlich.', metWhen: { not: { questNotStarted: Q_KRANZ } } },
  },
};

export const bodies: Record<string, BodyDef> = {
  'body.otter': {
    id: 'body.otter',
    sprite: 'characters.otter',
    moves: ['land', 'water'],
    speed: { land: 46, water: 36 },
  },
  'body.schnabbi': {
    id: 'body.schnabbi',
    sprite: 'characters.schnabbi',
    moves: ['land', 'water'],
    speed: { land: 30, water: 38 },
  },
  'body.otterprinzessin': {
    id: 'body.otterprinzessin',
    sprite: 'characters.otterprinzessin',
    moves: ['land', 'water'],
    speed: { land: 42, water: 36 },
  },
  // Axolotl leben im Wasser.
  'body.rosie': {
    id: 'body.rosie',
    sprite: 'characters.rosie',
    moves: ['water'],
    speed: { land: 0, water: 30 },
  },
  'body.bubbles': {
    id: 'body.bubbles',
    sprite: 'characters.bubbles',
    moves: ['water'],
    speed: { land: 0, water: 32 },
    traits: ['blasen'],
  },
  // Erdmännchen: flink an Land, schwimmt nicht.
  'body.meerkat': {
    id: 'body.meerkat',
    sprite: 'characters.meerkat',
    moves: ['land'],
    speed: { land: 52, water: 0 },
  },
  // Robbe: an Land eher gemütlich, im Wasser flink.
  'body.squichy': {
    id: 'body.squichy',
    sprite: 'characters.squichy',
    moves: ['land', 'water'],
    speed: { land: 18, water: 46 },
  },
  // Chamäleon: langsam und bedächtig, wechselt die Farbe.
  'body.chamaron': {
    id: 'body.chamaron',
    sprite: 'characters.chamaron',
    moves: ['land'],
    speed: { land: 22, water: 0 },
    traits: ['farbwechsel'],
  },
  // Die Schale des Erbsentrios: ein Körper, drei Sitze.
  'body.erbsenschale': {
    id: 'body.erbsenschale',
    sprite: 'characters.erbsenschale',
    moves: ['land'],
    speed: { land: 24, water: 0 },
    seats: 3,
  },
  'body.bean': {
    id: 'body.bean',
    sprite: 'characters.bean',
    moves: ['land'],
    speed: { land: 40, water: 0 },
  },
};

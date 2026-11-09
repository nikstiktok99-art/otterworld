import type { BodyDef, CharacterDef } from './types';
import { Q_KISSEN, Q_LICHT, Q_PICKNICK } from './ids';

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
};

import type { BodyDef, CharacterDef } from './types';
import { Q_LICHT } from './ids';

// Figuren-ID, Weltkörper-ID und Grafikschlüssel sind bewusst getrennt.
// Weitere Figuren aus dem Kanon (Rosie, Bubbles, Chamaron, Meerkat, Bean, Erbsentrio, Squichy,
// Otterprinzessin) kommen hinzu, sobald ihre Kapitel gebaut werden – siehe docs/INHALTSPLAN.md.

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
    // ENTWURF: Text im Freundebuch, frei ersetzbar.
    friend: { about: 'Dein erster Freund am Ufer. Er wohnt gleich am Steg.', metWhen: { not: { questNotStarted: Q_LICHT } } },
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
};

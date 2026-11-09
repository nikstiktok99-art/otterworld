// Entwicklungs-Platzhalter: schlichte, unterscheidbare Pixelformen, im Code gezeichnet.
// Keine fertige Grafik – Codex liefert die echten PNGs. Maße und Anker entsprechen exakt dem Katalog.
import type { Grid } from '../game/space';
import type { PainterId, SpriteDef } from './catalog';

type C = CanvasRenderingContext2D;

const OUT = '#3a2418';
const FUR = '#7a4a2e';
const FUR_D = '#5e3822';
const COOKIE = '#e8c49a';
const EYE = '#1d120c';
const MINT = '#a8d8c0';
const MINT_OUT = '#4f6b60';
const RIPPLE = '#d5f0f8';
const SHADOW = 'rgba(0,0,0,0.22)';

function rect(c: C, x: number, y: number, w: number, h: number, col: string) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Gefüllte Ellipse, pixelgenau (keine weichen Kanten). */
function ell(c: C, cx: number, cy: number, rx: number, ry: number, col: string) {
  c.fillStyle = col;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) c.fillRect(x, y, 1, 1);
    }
  }
}

/** Ellipse mit dunkler Kontur. */
function ellOut(c: C, cx: number, cy: number, rx: number, ry: number, fill: string, out = OUT) {
  ell(c, cx, cy, rx + 1, ry + 1, out);
  ell(c, cx, cy, rx, ry, fill);
}

/** Nur der Rand einer Ellipse (für Wasserringe). */
function ring(c: C, cx: number, cy: number, rx: number, ry: number, col: string) {
  c.fillStyle = col;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const ix = (x + 0.5 - cx) / Math.max(1, rx - 1.3);
      const iy = (y + 0.5 - cy) / Math.max(0.6, ry - 1);
      if (dx * dx + dy * dy <= 1 && ix * ix + iy * iy > 1) c.fillRect(x, y, 1, 1);
    }
  }
}

function clipAbove(c: C, w: number, yLine: number, draw: () => void) {
  c.save();
  c.beginPath();
  c.rect(0, 0, w, yLine);
  c.clip();
  draw();
  c.restore();
}

// ---------------- Figuren ----------------

function otterBody(c: C, back: boolean, dy: number, paw: number) {
  // Schwanz, Körper, Brust, Füße, Kopf, Ohren, Gesicht
  ellOut(c, 14, 37 + dy, 6, 2.5, FUR_D);
  ellOut(c, 23, 31 + dy, 9, 9, FUR);
  if (back) ell(c, 23, 30 + dy, 5, 6, FUR_D);
  else ell(c, 26, 32 + dy, 5, 6, COOKIE);
  rect(c, 18, 39 - (paw === 1 ? 1 : 0), 4, 2, FUR_D);
  rect(c, 26, 39 - (paw === 2 ? 1 : 0), 4, 2, FUR_D);
  ellOut(c, 22, 14 + dy, 2, 2, FUR);
  ellOut(c, 33, 14 + dy, 2, 2, FUR);
  ellOut(c, 28, 20 + dy, 8, 7, FUR);
  if (!back) {
    ell(c, 31, 23 + dy, 5, 3, COOKIE);
    rect(c, 26, 19 + dy, 1, 2, EYE);
    rect(c, 32, 19 + dy, 1, 2, EYE);
    rect(c, 34, 21 + dy, 2, 1, EYE);
    ell(c, 30, 30 + dy, 2, 3, FUR_D);
  } else {
    ell(c, 27, 18 + dy, 4, 3, FUR_D);
  }
}

function paintOtter(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  if (state === 'swim') {
    const bob = [0, -1, 0, 1][f % 4] ?? 0;
    clipAbove(c, 48, 37 + bob, () => otterBody(c, back, 5 + bob, 0));
    ring(c, 24, 37 + bob, 12, 2.5, RIPPLE);
    return;
  }
  ell(c, 24, 41, 9, 2, SHADOW);
  if (state === 'walk') {
    const dy = [0, -1, 0, -1][f % 4] ?? 0;
    otterBody(c, back, dy, f % 4 === 1 ? 1 : f % 4 === 3 ? 2 : 0);
  } else {
    otterBody(c, back, f % 2, 0);
  }
}

function schnabbiBody(c: C, back: boolean, dy: number, legs: number | null) {
  ellOut(c, 19, 35 + dy, 7, 3, MINT, MINT_OUT);
  if (legs !== null) {
    rect(c, 27, 39 - (legs === 1 ? 1 : 0), 4, 2, '#86b8a0');
    rect(c, 50, 39 - (legs === 2 ? 1 : 0), 4, 2, '#86b8a0');
  }
  ellOut(c, 40, 33 + dy, 22, 7.5, MINT, MINT_OUT);
  ell(c, 33, 31 + dy, 8, 3.5, '#f2b8c6');
  ell(c, 46, 37 + dy, 12, 1.5, '#f5e3a0');
  ellOut(c, 60, 31 + dy, 8, 6, MINT, MINT_OUT);
  ell(c, 60, 25 + dy, 7, 1.5, '#f8f0dc');
  ellOut(c, 72, 33 + dy, 9, 3.5, '#9fb3c4', MINT_OUT);
  rect(c, 70, 33 + dy, 5, 1, '#3d4a55');
  if (!back) rect(c, 63, 29 + dy, 1, 1, EYE);
}

function paintSchnabbi(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  if (state === 'swim') {
    const bob = f % 2;
    clipAbove(c, 88, 37 + bob, () => schnabbiBody(c, back, 3 + bob, null));
    ring(c, 44, 37 + bob, 26, 3, RIPPLE);
    return;
  }
  ell(c, 44, 41, 24, 2.5, SHADOW);
  if (state === 'walk') schnabbiBody(c, back, f % 2 === 0 ? 0 : -1, (f % 4) % 2 === 0 ? 1 : 2);
  else if (state === 'sit') schnabbiBody(c, back, 1 + (f % 2 === 1 ? 0 : 0), null);
  else schnabbiBody(c, back, f % 2 === 1 ? 1 : 0, 0);
}

/** Otterprinzessin: Otter-Grundform mit Kleid und Krone. */
function paintPrinzessin(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const crown = (dy: number) => {
    rect(c, 23, 9 + dy, 10, 3, '#f2c14e');
    for (const x of [23, 27, 31]) rect(c, x, 7 + dy, 2, 2, '#f2c14e');
    rect(c, 27, 10 + dy, 2, 1, '#e86a8a');
    rect(c, 23, 12 + dy, 10, 1, '#b8862b');
  };
  if (state === 'swim') {
    const bob = [0, -1, 0, 1][f % 4] ?? 0;
    paintOtter(c, f, state, dir);
    crown(5 + bob);
    return;
  }
  paintOtter(c, f, state, dir);
  const dy = state === 'walk' ? ([0, -1, 0, -1][f % 4] ?? 0) : f % 2;
  // Kleid über dem Bauch, mit hellem Saum
  ell(c, 23, 35 + dy, 9, 5, '#b98ad0');
  ell(c, 23, 34 + dy, 7, 3, back ? '#a777c0' : '#cfa5e2');
  rect(c, 15, 39 + dy, 17, 1, '#f3e4fa');
  crown(dy);
}

/** Axolotl (Rosie rosa, Bubbles blau): lebt im Wasser, große Kiemenbüschel. */
function paintAxolotl(c: C, f: number, dir: string, farbe: string) {
  const back = dir === 'ne';
  const col = farbe === 'blau' ? { body: '#8fc4ef', dark: '#5f9fd6', gill: '#4f7fd0', out: '#2f4f7a' } : { body: '#f4a6c1', dark: '#e07fa3', gill: '#d9547f', out: '#7a2f4a' };
  const bob = [0, -1, 0, 1][f % 4] ?? 0;
  const dy = 3 + bob;
  clipAbove(c, 48, 37 + bob, () => {
    ellOut(c, 11, 33 + dy, 5, 2.5, col.dark, col.out); // Schwanzflosse
    ellOut(c, 21, 33 + dy, 10, 4.5, col.body, col.out); // Körper
    ellOut(c, 32, 30 + dy, 6.5, 5, col.body, col.out); // Kopf
    // Kiemenbüschel (drei Zacken je Seite)
    for (const [x, y] of [[26, 24], [25, 27], [26, 30], [38, 24], [39, 27], [38, 30]] as const) {
      rect(c, x, y + dy, 2, 2, col.gill);
    }
    if (!back) {
      rect(c, 30, 29 + dy, 1, 2, EYE);
      rect(c, 35, 29 + dy, 1, 2, EYE);
      rect(c, 31, 32 + dy, 4, 1, col.out);
    }
  });
  ring(c, 22, 37 + bob, 14, 2.5, RIPPLE);
}

/** Erdmännchen: steht aufrecht Wache (idle) oder flitzt auf allen vieren (walk). */
function paintMeerkat(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const fur = '#c9a46c';
  const dark = '#8a6a40';
  const out = '#5a4128';
  if (state === 'walk') {
    const dy = f % 2 === 0 ? 0 : -1;
    ell(c, 24, 41, 10, 1.5, SHADOW);
    rect(c, 10, 33 + dy, 6, 2, dark); // Schwanz
    ellOut(c, 22, 34 + dy, 9, 4, fur, out);
    for (const [x, lift] of [[17, f % 4 === 1 ? 1 : 0], [27, f % 4 === 3 ? 1 : 0]] as const) rect(c, x, 38 - lift, 3, 3, dark);
    ellOut(c, 32, 31 + dy, 4.5, 3.5, fur, out);
    if (!back) {
      rect(c, 33, 30 + dy, 2, 2, '#3a2a18');
      rect(c, 36, 32 + dy, 1, 1, EYE);
    }
    return;
  }
  const dy = f % 2;
  ell(c, 24, 41, 6, 1.5, SHADOW);
  rect(c, 29, 33, 2, 8, dark); // Schwanz als Stütze
  ellOut(c, 24, 30 + dy, 5, 9, fur, out);
  if (!back) ell(c, 25, 31 + dy, 3, 6, '#e8d2a6');
  rect(c, 21, 38, 3, 2, dark);
  rect(c, 25, 38, 3, 2, dark);
  rect(c, 20, 26 + dy, 2, 4, dark); // Pfötchen vor der Brust
  ellOut(c, 25, 18 + dy, 4, 3.5, fur, out);
  rect(c, 21, 15 + dy, 2, 2, dark);
  rect(c, 27, 15 + dy, 2, 2, dark);
  if (!back) {
    rect(c, 23, 17 + dy, 2, 2, '#3a2a18');
    rect(c, 26, 17 + dy, 2, 2, '#3a2a18');
    rect(c, 28, 19 + dy, 1, 1, EYE);
  }
}

/** Mini-Robbe Squichy: rund, grau, große Augen. */
function paintSquichy(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const body = '#c3ccd4';
  const out = '#4f5a66';
  const draw = (dy: number) => {
    ellOut(c, 13, 36 + dy, 4, 2, '#a9b4be', out); // Hinterflossen
    ellOut(c, 22, 34 + dy, 10, 6, body, out);
    for (const [x, y] of [[18, 32], [23, 36], [26, 31]] as const) rect(c, x, y + dy, 2, 1, '#9aa6b2');
    ellOut(c, 31, 29 + dy, 6, 5, body, out);
    rect(c, 22, 38 + dy, 4, 2, '#a9b4be'); // Vorderflosse
    if (!back) {
      rect(c, 29, 27 + dy, 2, 3, EYE);
      rect(c, 33, 27 + dy, 2, 3, EYE);
      rect(c, 29, 27 + dy, 1, 1, '#ffffff');
      rect(c, 31, 31 + dy, 2, 1, '#3d4a55');
      rect(c, 35, 31 + dy, 3, 1, '#9aa6b2');
      rect(c, 26, 31 + dy, 3, 1, '#9aa6b2');
    }
  };
  if (state === 'swim') {
    const bob = [0, -1, 0, 1][f % 4] ?? 0;
    clipAbove(c, 48, 37 + bob, () => draw(4 + bob));
    ring(c, 24, 37 + bob, 13, 2.5, RIPPLE);
    return;
  }
  ell(c, 23, 41, 11, 1.5, SHADOW);
  draw(state === 'walk' ? (f % 2 === 0 ? 0 : -1) : 0);
}

/** Chamäleon: Grundfarbe neutral (das Spiel tönt sie), Ringelschwanz, Kamm, Kulleraugen. */
function paintChamaron(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const body = '#d8e8c8';
  const out = '#4f6b40';
  const dy = state === 'walk' ? (f % 2 === 0 ? 0 : -1) : 0;
  ell(c, 24, 41, 10, 1.5, SHADOW);
  // Ringelschwanz
  ring(c, 12, 33 + dy, 4, 4, out);
  ellOut(c, 23, 33 + dy, 9, 5, body, out);
  for (const x of [17, 21, 25, 29]) rect(c, x, 28 + dy, 2, 1, out); // Kamm
  const lift = state === 'walk' ? f % 4 : 0;
  for (const [x, l] of [[18, lift === 1 ? 1 : 0], [27, lift === 3 ? 1 : 0]] as const) rect(c, x, 37 - l + dy, 2, 4, out);
  ellOut(c, 33, 31 + dy, 5.5, 4.5, body, out);
  if (!back) {
    ellOut(c, 34, 29 + dy, 2.5, 2.5, '#f6f6e8', out);
    rect(c, 34 + (f % 2), 29 + dy, 1, 1, EYE);
    rect(c, 36, 33 + dy, 2, 1, out);
  }
}

/** Schale mit drei Erbsen: links Beano, Mitte Beani, rechts Beanz. */
function paintErbsenschale(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const hop = state === 'walk' ? [0, -2, 0, -1][f % 4]! : 0;
  ell(c, 24, 41, 12, 2, SHADOW);
  const pea = (x: number, y: number, mood: 'froh' | 'sanft' | 'neugierig', bob: number) => {
    ellOut(c, x, y + bob, 5, 5, '#8cc65a', '#3f6e25');
    ell(c, x - 2, y - 2 + bob, 1.5, 1, '#b4e08a');
    if (back) return;
    if (mood === 'sanft') {
      rect(c, x - 3, y + bob, 2, 1, EYE);
      rect(c, x + 1, y + bob, 2, 1, EYE);
    } else {
      rect(c, x - 2, y - 1 + bob, 1, 2, EYE);
      rect(c, x + 2, y - 1 + bob, 1, 2, EYE);
    }
    if (mood === 'froh') rect(c, x - 1, y + 2 + bob, 3, 1, '#3f6e25');
    if (mood === 'neugierig') rect(c, x, y + 2 + bob, 1, 1, '#3f6e25');
  };
  pea(16, 27 + hop, 'froh', f % 2 === 0 ? 0 : -1);
  pea(24, 25 + hop, 'sanft', 0);
  pea(32, 27 + hop, 'neugierig', f % 2 === 1 ? 0 : -1);
  // Schale
  ellOut(c, 24, 33 + hop, 15, 6, '#f2e6cc', '#8a6a48');
  rect(c, 10, 31 + hop, 29, 2, '#f2e6cc');
  rect(c, 12, 34 + hop, 25, 1, '#d9c39b');
  rect(c, 18, 37 + hop, 12, 1, '#c9645a');
}

/** Rentier: braun, helle Brust, Geweih. */
function paintBean(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const fur = '#9a6a48';
  const out = '#4a3020';
  const dy = state === 'walk' ? (f % 2 === 0 ? 0 : -1) : f % 2;
  ell(c, 24, 41, 11, 1.5, SHADOW);
  const step = state === 'walk' ? f % 4 : 0;
  for (const [x, l] of [[15, step === 1 ? 1 : 0], [19, step === 3 ? 1 : 0], [27, step === 3 ? 1 : 0], [31, step === 1 ? 1 : 0]] as const) {
    rect(c, x, 35 - l, 2, 6, out);
  }
  ellOut(c, 23, 31 + dy, 11, 5.5, fur, out);
  if (!back) ell(c, 30, 32 + dy, 3, 3, '#e8d2b0');
  ellOut(c, 34, 22 + dy, 4.5, 4, fur, out);
  rect(c, 32, 25 + dy, 3, 5, fur);
  // Geweih
  for (const [x, y, w, h] of [[31, 13, 1, 6], [29, 13, 3, 1], [29, 11, 1, 2], [37, 13, 1, 6], [37, 13, 3, 1], [39, 11, 1, 2], [34, 15, 1, 3]] as const) {
    rect(c, x, y + dy, w, h, '#c8a878');
  }
  if (!back) {
    rect(c, 35, 21 + dy, 1, 2, EYE);
    ellOut(c, 38, 24 + dy, 1.5, 1.2, '#3a2a20', out);
  }
}

function paintTheke(c: C) {
  ell(c, 40, 31, 38, 1.5, SHADOW);
  rect(c, 2, 12, 76, 19, '#8a5a36');
  rect(c, 2, 12, 76, 4, '#c8955c');
  rect(c, 2, 16, 76, 1, '#5a3a20');
  for (let x = 8; x < 76; x += 12) rect(c, x, 18, 1, 12, '#6e4528');
  // Tassen und Gläschen
  for (const [x, col] of [[12, '#f2e6cc'], [28, '#e8a0a8'], [52, '#9fc8de'], [66, '#f2e6cc']] as const) {
    rect(c, x, 7, 6, 5, col);
    rect(c, x + 6, 8, 2, 2, col);
  }
}

function paintBasteltisch(c: C) {
  ell(c, 16, 23, 14, 1.5, SHADOW);
  rect(c, 4, 12, 3, 11, '#6e4b2c');
  rect(c, 25, 12, 3, 11, '#6e4b2c');
  rect(c, 1, 8, 30, 5, '#d8b07a');
  rect(c, 1, 8, 30, 1, '#ecc894');
  ellOut(c, 9, 5, 3, 3, '#c9a0e8', '#7a5a9a');
  ellOut(c, 17, 6, 2, 2, '#e86a8a', '#7a2f4a');
  rect(c, 22, 5, 5, 1, '#9aa3ad');
  rect(c, 22, 7, 5, 1, '#9aa3ad');
}

function paintCafetisch(c: C) {
  ell(c, 16, 23, 12, 1.5, SHADOW);
  rect(c, 15, 12, 2, 11, '#6e4b2c');
  ellOut(c, 16, 10, 13, 4, '#d8b07a', '#8a5a36');
  rect(c, 12, 5, 6, 5, '#f2e6cc');
  rect(c, 18, 6, 2, 2, '#f2e6cc');
  rect(c, 13, 5, 4, 1, '#8a5a36');
}

function paintKatze(c: C, f: number, farbe: string) {
  const col = farbe === 'rot' ? { fur: '#e09a5a', dark: '#b06a30' } : { fur: '#9aa3ad', dark: '#6a7380' };
  ell(c, 8, 14, 7, 1.5, SHADOW);
  ellOut(c, 8, 10 - (f % 2 === 1 ? 0.5 : 0), 6.5, 4, col.fur, '#3a2a20');
  ellOut(c, 4, 9, 3, 2.5, col.fur, '#3a2a20');
  rect(c, 2, 6, 1, 2, col.dark);
  rect(c, 5, 6, 1, 2, col.dark);
  rect(c, 3, 9, 3, 1, '#3a2a20'); // geschlossene Augen
  rect(c, 10, 12, 4, 1, col.dark); // Schwanz um den Körper
  for (const x of [8, 11]) rect(c, x, 7, 1, 2, col.dark);
}

function paintZimmerpflanze(c: C) {
  ell(c, 8, 31, 5, 1, SHADOW);
  rect(c, 3, 23, 10, 8, '#c9645a');
  rect(c, 3, 23, 10, 1, '#e07a6e');
  for (const [x, y, rx] of [[5, 16, 4], [11, 14, 4], [8, 9, 4], [4, 9, 3], [12, 20, 3]] as const) ellOut(c, x, y, rx, 2.5, '#5f9142', '#2e4c22');
  rect(c, 8, 12, 1, 11, '#3f6e35');
}

function paintKochtopf(c: C, f: number) {
  ell(c, 16, 39, 14, 1.5, SHADOW);
  rect(c, 3, 26, 26, 13, '#5a5f66'); // Herd
  rect(c, 3, 26, 26, 2, '#7a8088');
  ellOut(c, 16, 18, 12, 8, '#9aa3ad', '#3d4249'); // Topf
  ell(c, 16, 13, 10, 2.5, '#d8a25a'); // Brühe
  rect(c, 3, 16, 2, 3, '#3d4249');
  rect(c, 27, 16, 2, 3, '#3d4249');
  // Dampf
  for (const [x, y] of [[11, 7], [17, 4], [22, 8]] as const) rect(c, x + (f % 2), y - (f % 2), 2, 2, 'rgba(255,255,255,0.7)');
}

function paintHotpottisch(c: C) {
  ell(c, 16, 39, 14, 2, SHADOW);
  rect(c, 14, 26, 4, 13, '#5a3a20');
  ellOut(c, 16, 22, 15, 7, '#8a3a2e', '#4a1e18');
  ellOut(c, 16, 19, 6, 4, '#3d4249', '#1e2226');
  ell(c, 16, 17, 4.5, 1.5, '#d8a25a');
  rect(c, 5, 22, 3, 1, '#f2e6cc');
  rect(c, 24, 22, 3, 1, '#f2e6cc');
}

function paintLaterne(c: C) {
  ell(c, 8, 31, 4, 1, SHADOW);
  rect(c, 7, 14, 2, 17, '#5a3a20');
  ellOut(c, 8, 9, 5, 6, '#d94a3a', '#7a1e18');
  rect(c, 6, 3, 4, 1, '#3a2a20');
  rect(c, 6, 15, 4, 1, '#3a2a20');
  ell(c, 8, 9, 2, 3, '#f2a65a');
}

function paintFuchsbauhuegel(c: C) {
  ell(c, 24, 39, 22, 2, SHADOW);
  ellOut(c, 24, 28, 21, 11, '#8a6a48', '#4a3020');
  ell(c, 24, 19, 16, 4, '#5f9142');
  for (const x of [10, 15, 33, 38]) rect(c, x, 18, 1, 4, '#3f6e35');
  ell(c, 24, 33, 7, 6, '#2a1a10'); // Eingang
  for (const [x, y, w] of [[12, 26, 6], [31, 25, 6], [16, 34, 3]] as const) rect(c, x, y, w, 1, '#5a3a20'); // Wurzeln
}

function paintTeepflanze(c: C) {
  ell(c, 8, 22, 5, 1, SHADOW);
  rect(c, 4, 16, 8, 6, '#f2e6cc');
  rect(c, 4, 16, 8, 1, '#d9c39b');
  for (const [x, y] of [[5, 12], [10, 11], [7, 7], [4, 8], [11, 6]] as const) ellOut(c, x, y, 2.5, 1.5, '#7cbf68', '#3f6e35');
  rect(c, 8, 8, 1, 8, '#3f6e35');
}

function paintWollfaden(c: C) {
  ell(c, 8, 14, 5, 1, SHADOW);
  for (let i = 0; i < 10; i++) rect(c, 3 + i, 10 + Math.round(Math.sin(i * 0.9) * 2), 1, 1, i % 2 ? '#e86a8a' : '#c9a0e8');
  ellOut(c, 12, 10, 2, 2, '#e86a8a', '#7a2f4a');
}

function paintMehlsack(c: C) {
  ell(c, 8, 14, 5, 1, SHADOW);
  ellOut(c, 8, 9, 5, 5, '#efe6d2', '#9a8a6a');
  rect(c, 6, 3, 4, 2, '#c9b48a');
  rect(c, 7, 9, 2, 2, '#d9c39b');
}

function paintGemuesekiste(c: C) {
  ell(c, 8, 14, 6, 1, SHADOW);
  rect(c, 2, 8, 12, 6, '#a6784a');
  rect(c, 2, 8, 12, 1, '#c8955c');
  rect(c, 2, 11, 12, 1, '#6e4b2c');
  for (const x of [4, 7, 10]) {
    rect(c, x, 4, 2, 4, '#f08a3a');
    rect(c, x, 3, 2, 1, '#5f9142');
  }
}

function paintKraeutertopf(c: C) {
  ell(c, 8, 14, 5, 1, SHADOW);
  rect(c, 4, 9, 8, 5, '#c9645a');
  for (const [x, y] of [[5, 6], [8, 4], [11, 6], [7, 7]] as const) ellOut(c, x, y, 1.5, 1.5, '#5f9142', '#2e4c22');
}

function paintTannenzapfen(c: C) {
  ell(c, 8, 14, 4, 1, SHADOW);
  ellOut(c, 8, 9, 3.5, 5, '#8a5a36', '#4a3020');
  for (let y = 5; y < 14; y += 2) rect(c, 6, y, 5, 1, '#6e4528');
}

function paintBeerenstrauch(c: C) {
  ell(c, 8, 22, 6, 1, SHADOW);
  ellOut(c, 8, 15, 6.5, 6, '#4d7d38', '#2e4c22');
  for (const [x, y] of [[5, 12], [10, 14], [7, 17], [11, 18], [4, 16]] as const) {
    rect(c, x, y, 2, 2, '#d94a5a');
    rect(c, x, y, 1, 1, '#ff9aa6');
  }
}

function paintMoos(c: C) {
  ellOut(c, 8, 11, 6, 3, '#6fae5a', '#3f6e35');
  for (const [x, y] of [[5, 10], [9, 9], [11, 11], [7, 12]] as const) rect(c, x, y, 1, 1, '#9bd487');
}

function paintKletterpflanze(c: C) {
  ell(c, 8, 30, 5, 1, SHADOW);
  rect(c, 4, 24, 8, 6, '#c9645a');
  rect(c, 8, 4, 1, 20, '#a6784a');
  for (let y = 6; y < 24; y += 3) {
    ellOut(c, y % 2 ? 6 : 10, y, 2, 1.5, '#7cbf68', '#3f6e35');
  }
  rect(c, 7, 14, 3, 1, '#e86a8a'); // Wollfaden
}

function paintWollkissen(c: C) {
  ell(c, 8, 14, 6, 1, SHADOW);
  ellOut(c, 8, 10, 6.5, 3.5, '#e8a0c8', '#9a4a7a');
  for (let x = 3; x < 14; x += 2) rect(c, x, 9, 1, 3, '#c9a0e8');
}

function paintTeigtaschen(c: C, f: number) {
  ell(c, 8, 14, 6, 1, SHADOW);
  ellOut(c, 8, 11, 7, 2.5, '#f2e6cc', '#9a8a6a');
  for (const x of [5, 8, 11]) ellOut(c, x, 9, 2, 1.5, '#f6e2b8', '#b8925a');
  rect(c, 6 + (f % 2), 3, 1, 3, 'rgba(255,255,255,0.7)');
  rect(c, 10 - (f % 2), 4, 1, 2, 'rgba(255,255,255,0.7)');
}

function paintKraeutersuppe(c: C, f: number) {
  ell(c, 8, 14, 6, 1, SHADOW);
  ellOut(c, 8, 11, 6, 3, '#f6c7d0', '#b97a88');
  ell(c, 8, 10, 4.5, 1.5, '#9fbf5a');
  rect(c, 6, 10, 1, 1, '#5f9142');
  rect(c, 10, 9, 1, 1, '#f08a3a');
  rect(c, 7 + (f % 2), 4, 1, 3, 'rgba(255,255,255,0.7)');
}

function paintZapfenkranz(c: C) {
  ell(c, 8, 30, 4, 1, SHADOW);
  rect(c, 7, 18, 2, 12, '#7a5a3a');
  ring(c, 8, 11, 6, 6, '#4d7d38');
  for (const [x, y] of [[3, 9], [12, 9], [5, 15], [11, 15], [8, 5]] as const) rect(c, x, y, 2, 3, '#8a5a36');
  rect(c, 7, 16, 2, 2, '#d94a5a');
}

function paintBeerenlicht(c: C, f: number, an: boolean) {
  ell(c, 8, 22, 4, 1, SHADOW);
  rect(c, 4, 9, 8, 13, an ? (f % 2 ? '#fff3b0' : '#ffe68a') : '#cfe6ee');
  rect(c, 4, 9, 8, 1, '#9fb3c4');
  rect(c, 3, 7, 10, 2, '#a6784a');
  for (const [x, y] of [[5, 16], [8, 18], [10, 15], [6, 19]] as const) rect(c, x, y, 2, 2, '#d94a5a');
  ellOut(c, 8, 13, 1.5, 1.5, an ? '#ffffff' : '#b8c6d4', '#5c6b7a');
}

function paintMooskissen(c: C) {
  ell(c, 8, 14, 6, 1, SHADOW);
  ellOut(c, 8, 10, 6.5, 3.5, '#6fae5a', '#3f6e35');
  for (const [x, y] of [[5, 9], [9, 8], [11, 11]] as const) rect(c, x, y, 1, 1, '#9bd487');
  rect(c, 7, 6, 1, 4, '#4f8fd6');
  rect(c, 8, 6, 1, 3, '#7fb0e6');
}

// ---------------- Umgebung und Dinge ----------------

function paintAussichtsstein(c: C, wimpel: boolean) {
  ell(c, 16, 23, 14, 1.5, SHADOW);
  ellOut(c, 16, 17, 13, 6, '#9aa3ad', '#555d66');
  ell(c, 13, 15, 7, 2.5, '#b8c0c8');
  if (wimpel) {
    rect(c, 22, 0, 1, 14, '#7a5a3a');
    rect(c, 23, 1, 6, 1, '#e86a8a');
    rect(c, 23, 2, 5, 1, '#e86a8a');
    rect(c, 23, 3, 4, 1, '#f5d76e');
    rect(c, 23, 4, 2, 1, '#f5d76e');
    rect(c, 20, 6, 2, 3, '#4f8fd6');
  }
}

function paintFeder(c: C) {
  ell(c, 8, 14, 5, 1, SHADOW);
  for (let i = 0; i < 9; i++) rect(c, 4 + i, 12 - i, 1, 1, '#5a4128'); // Kiel
  for (let i = 1; i < 8; i++) {
    rect(c, 3 + i, 10 - i, 2, 2, i % 2 ? '#4f8fd6' : '#7fb0e6');
    rect(c, 5 + i, 12 - i, 1, 1, '#f2a65a');
  }
}

function paintSonnenblume(c: C) {
  ell(c, 8, 30, 4, 1, SHADOW);
  rect(c, 7, 12, 2, 18, '#4f7d38');
  ell(c, 5, 21, 3, 1.5, '#5f9142');
  ell(c, 11, 25, 3, 1.5, '#5f9142');
  ellOut(c, 8, 8, 6, 5.5, '#f5c542', '#b8862b');
  ellOut(c, 8, 8, 2.5, 2.5, '#6b4423', '#4a2e18');
}

function paintFederwimpel(c: C, f: number) {
  ell(c, 8, 30, 4, 1, SHADOW);
  rect(c, 5, 6, 2, 24, '#7a5a3a');
  const w = f % 2;
  for (let y = 0; y < 7; y++) rect(c, 7, 7 + y, 8 - y - (y > 2 ? w : 0), 1, y < 3 ? '#e86a8a' : '#f5d76e');
  rect(c, 3, 4, 2, 4, '#4f8fd6');
  rect(c, 2, 5, 1, 3, '#7fb0e6');
}

function paintSchilfball(c: C) {
  ell(c, 8, 14, 5, 1, SHADOW);
  ellOut(c, 8, 9, 5, 4.5, '#d8c08a', '#8c7040');
  for (let y = 5; y < 14; y++) for (let x = 3; x < 13; x++) if ((x + y) % 3 === 0) rect(c, x, y, 1, 1, '#bfa36a');
  rect(c, 6, 6, 2, 1, '#efe0b0');
}

function paintSonnenblumentopf(c: C) {
  ell(c, 8, 30, 5, 1, SHADOW);
  ellOut(c, 8, 26, 5.5, 3, '#f6c7d0', '#b97a88');
  for (const x of [5, 8, 11]) rect(c, x, 25, 1, 3, '#e6a3b3');
  rect(c, 7, 12, 2, 12, '#4f7d38');
  ell(c, 5, 18, 2.5, 1.2, '#5f9142');
  ellOut(c, 8, 9, 4.5, 4, '#f5c542', '#b8862b');
  ell(c, 8, 9, 1.8, 1.8, '#6b4423');
}

function paintPicknickdecke(c: C) {
  ell(c, 24, 30, 22, 2, SHADOW);
  for (let y = 12; y < 30; y++) {
    const shift = Math.floor((30 - y) / 3);
    for (let x = 2; x < 44; x++) {
      const px = x + shift;
      if (px > 46) continue;
      const check = (Math.floor(x / 4) + Math.floor(y / 3)) % 2 === 0;
      rect(c, px, y, 1, 1, check ? '#e8a0a8' : '#fbf1e6');
    }
  }
  // Körbchen
  rect(c, 30, 8, 10, 7, '#c08a52');
  rect(c, 30, 8, 10, 1, '#8a5a30');
  rect(c, 31, 5, 1, 3, '#8a5a30');
  rect(c, 38, 5, 1, 3, '#8a5a30');
  rect(c, 31, 4, 8, 1, '#8a5a30');
}

function paintBastelstumpf(c: C) {
  ell(c, 8, 23, 7, 1.5, SHADOW);
  rect(c, 2, 12, 12, 11, '#7a5232');
  rect(c, 2, 12, 1, 11, '#5a3a20');
  rect(c, 13, 12, 1, 11, '#5a3a20');
  ellOut(c, 8, 12, 6, 2.5, '#c9a06a', '#5a3a20');
  ell(c, 8, 12, 3, 1, '#a9804a');
  // Garnknäuel und Schere
  ellOut(c, 5, 9, 2, 2, '#e86a8a', '#7a2f4a');
  rect(c, 10, 8, 3, 1, '#9aa3ad');
  rect(c, 10, 10, 3, 1, '#9aa3ad');
}

function paintWiesenbluete(c: C) {
  ell(c, 8, 14, 5, 1, SHADOW);
  for (const [x, top, col] of [[4, 6, '#f2a0c0'], [8, 4, '#f5d76e'], [12, 7, '#c9a0e8']] as const) {
    rect(c, x, top + 2, 1, 13 - top - 2, '#5f8c42');
    rect(c, x - 1, top, 3, 3, col);
    rect(c, x, top + 1, 1, 1, '#fff6d8');
  }
}

function paintGlitzerkiesel(c: C) {
  ell(c, 8, 14, 5, 1, SHADOW);
  ellOut(c, 8, 10, 4.5, 3.5, '#b8c6d4', '#5c6b7a');
  ell(c, 7, 9, 2, 1.2, '#dfe8f0');
  rect(c, 10, 7, 1, 3, '#ffffff');
  rect(c, 9, 8, 3, 1, '#ffffff');
}

function paintSeerosenblatt(c: C, f: number) {
  const bob = f % 2;
  ellOut(c, 8, 9 + bob, 6, 3.5, '#6fae5a', '#3f6e35');
  rect(c, 8, 6 + bob, 1, 3, '#3f6e35');
  rect(c, 5, 8 + bob, 2, 1, '#8fc97a');
  ring(c, 8, 12 + bob, 7.5, 2, RIPPLE);
}

function paintBluetengirlande(c: C) {
  ell(c, 8, 30, 6, 1, SHADOW);
  rect(c, 1, 12, 1, 18, '#7a5a3a');
  rect(c, 14, 12, 1, 18, '#7a5a3a');
  const flowers = ['#f2a0c0', '#f5d76e', '#c9a0e8', '#f2a0c0', '#f5d76e'];
  for (let x = 2; x < 14; x++) {
    const sag = Math.round(4 * Math.sin(((x - 1) / 13) * Math.PI));
    rect(c, x, 13 + sag, 1, 1, '#e9dcc4');
    if (x % 3 === 0) rect(c, x - 1, 13 + sag, 2, 2, flowers[(x / 3) % flowers.length]!);
  }
  ellOut(c, 8, 18, 1.5, 1.5, '#b8c6d4', '#5c6b7a');
}

function paintSeerosenkissen(c: C) {
  ell(c, 8, 14, 6, 1, SHADOW);
  ellOut(c, 8, 10, 6.5, 3.5, '#7cbf68', '#3f6e35');
  ell(c, 8, 9, 4, 1.5, '#9bd487');
  ellOut(c, 8, 9, 1.5, 1.2, '#f2a0c0', '#c0607f');
}

function paintKiesellicht(c: C, f: number, an: boolean) {
  ell(c, 8, 14, 5, 1, SHADOW);
  // Muschel als Schale
  ellOut(c, 8, 11, 6, 3, '#f6c7d0', '#b97a88');
  for (const x of [4, 6, 10, 12]) rect(c, x, 10, 1, 3, '#e6a3b3');
  const glow = an ? ['#fff3b0', '#ffe68a'][f % 2]! : '#b8c6d4';
  ellOut(c, 6, 9, 1.5, 1.5, glow, an ? '#d9a640' : '#5c6b7a');
  ellOut(c, 10, 9, 1.5, 1.5, glow, an ? '#d9a640' : '#5c6b7a');
  if (an) rect(c, 8, 6, 1, 2, '#fff8d8');
}

function paintBlase(c: C) {
  ring(c, 3, 3, 2.6, 2.6, '#e8f8ff');
  rect(c, 2, 1, 1, 1, '#ffffff');
}

function paintBau(c: C) {
  ell(c, 24, 39, 22, 2, SHADOW);
  ellOut(c, 24, 27, 21, 12, '#7b5a3c');
  ell(c, 24, 16, 17, 4, '#6f9e4f');
  for (const x of [10, 16, 31, 37]) rect(c, x, 15, 1, 3, '#5f8c42');
  for (const [x, y, w] of [[8, 24, 6], [34, 22, 6], [12, 33, 4], [33, 32, 5]] as const) rect(c, x, y, w, 1, '#4f3522');
  ell(c, 24, 32, 8, 8, '#24160e');
  // karierte Gardine
  for (let y = 25; y < 31; y++) {
    for (let x = 17; x < 31; x++) {
      if (x >= 23 && x <= 24) continue;
      const dx = (x + 0.5 - 24) / 8;
      const dy2 = (y + 0.5 - 32) / 8;
      if (dx * dx + dy2 * dy2 > 1) continue;
      rect(c, x, y, 1, 1, (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0 ? '#f2e6cc' : '#c9645a');
    }
  }
  rect(c, 18, 38, 12, 1, '#a88a62');
}

function paintWerkbank(c: C) {
  ell(c, 16, 23, 14, 1.5, SHADOW);
  rect(c, 4, 12, 3, 11, '#6e4b2c');
  rect(c, 25, 12, 3, 11, '#6e4b2c');
  rect(c, 1, 8, 30, 5, '#a0703f');
  rect(c, 1, 8, 30, 1, '#c8955c');
  rect(c, 1, 12, 30, 1, '#5a3a20');
  rect(c, 6, 5, 8, 3, '#c8a070');
  rect(c, 20, 4, 2, 4, '#7a5a3a');
  rect(c, 18, 3, 6, 2, '#8a8f96');
}

function paintWegweiser(c: C) {
  ell(c, 8, 31, 4, 1, SHADOW);
  rect(c, 7, 9, 2, 22, '#6e4b2c');
  rect(c, 7, 9, 1, 22, '#8a5f38');
  // Schild mit Spitze nach rechts
  rect(c, 2, 6, 10, 6, '#c8955c');
  rect(c, 12, 7, 1, 4, '#c8955c');
  rect(c, 13, 8, 1, 2, '#c8955c');
  rect(c, 2, 6, 10, 1, '#e0b47c');
  rect(c, 2, 11, 10, 1, '#5a3a20');
  rect(c, 1, 6, 1, 6, '#5a3a20');
  rect(c, 4, 8, 6, 1, '#7a5030');
  rect(c, 4, 10, 4, 1, '#7a5030');
}

function paintSchilfhalm(c: C) {
  // Ein liegendes Bündel heller Halme mit Band – bewusst anders als das stehende Schilf im Boden.
  ell(c, 8, 13, 7, 1.5, SHADOW);
  for (const [y, col] of [[7, '#e2e39a'], [8, '#c9d27a'], [9, '#e2e39a'], [10, '#b8c46a'], [11, '#d4da86']] as const) {
    rect(c, 2, y, 12, 1, col);
  }
  rect(c, 1, 7, 1, 5, '#8c9a4c');
  rect(c, 14, 8, 1, 3, '#8c9a4c');
  // Kolben an den Spitzen
  rect(c, 12, 5, 3, 2, '#7a4f2c');
  rect(c, 11, 4, 2, 1, '#7a4f2c');
  // Band
  rect(c, 7, 6, 2, 7, '#b35a3a');
  rect(c, 7, 6, 2, 1, '#d47a52');
}

function paintSchilfmatte(c: C) {
  ell(c, 8, 12, 7, 1.5, SHADOW);
  rect(c, 1, 5, 14, 7, '#d8c08a');
  for (let y = 5; y < 12; y++) {
    for (let x = 1; x < 15; x++) {
      if ((x + y) % 3 === 0) rect(c, x, y, 1, 1, '#bfa36a');
    }
  }
  rect(c, 1, 4, 14, 1, '#a88a52');
  rect(c, 1, 12, 14, 1, '#8c7040');
  rect(c, 0, 5, 1, 7, '#a88a52');
  rect(c, 15, 5, 1, 7, '#a88a52');
}

function paintBank(c: C) {
  ell(c, 8, 21, 7, 1.5, SHADOW);
  rect(c, 2, 14, 2, 7, '#5a3c22');
  rect(c, 12, 14, 2, 7, '#5a3c22');
  rect(c, 1, 11, 14, 4, '#9a7350');
  rect(c, 1, 11, 14, 1, '#c09468');
  rect(c, 1, 14, 14, 1, '#5a3c22');
  rect(c, 2, 5, 12, 3, '#8a6644');
  rect(c, 2, 5, 12, 1, '#b48a5e');
  rect(c, 3, 8, 1, 3, '#5a3c22');
  rect(c, 12, 8, 1, 3, '#5a3c22');
}

function paintWindspiel(c: C, f: number) {
  ell(c, 8, 30, 4, 1, SHADOW);
  rect(c, 7, 6, 2, 24, '#7a5a3a');
  rect(c, 7, 6, 1, 24, '#9a7650');
  rect(c, 3, 5, 10, 2, '#6e4b2c');
  const sway = [0, 1, 0][f % 3]!;
  for (const [x, len] of [[4, 5], [8, 8], [12, 5]] as const) {
    rect(c, x, 7, 1, len, '#d8cbb0');
    ellOut(c, x + (x === 8 ? 0 : sway), 8 + len, 1.5, 1.5, '#f6c7d0', '#b97a88');
  }
}

function paintHinweis(c: C) {
  // Sprechblase mit drei Punkten (kein Schriftzeichen, kein Emoji)
  ellOut(c, 6, 5, 5, 4, '#fff8ec', '#3b2a20');
  rect(c, 4, 9, 2, 2, '#3b2a20');
  rect(c, 5, 9, 1, 1, '#fff8ec');
  for (const x of [3, 6, 9]) rect(c, x, 4, 1, 2, '#d9733a');
}

function log(c: C, y: number) {
  rect(c, 2, y, 12, 4, '#8a6a4a');
  rect(c, 2, y - 1, 12, 1, '#4a3424');
  rect(c, 2, y + 4, 12, 1, '#4a3424');
  rect(c, 1, y, 1, 4, '#4a3424');
  rect(c, 14, y, 1, 4, '#4a3424');
  rect(c, 2, y + 1, 1, 2, '#c8a882');
  rect(c, 5, y + 1, 4, 1, '#6e5238');
}

function paintTreibholz(c: C) {
  ell(c, 8, 14, 6, 1, SHADOW);
  log(c, 9);
}

function paintTreibholzTreibend(c: C, f: number) {
  log(c, 8 + (f % 2));
  ring(c, 8, 13, 7.5, 2.2, RIPPLE);
}

function paintMuschel(c: C) {
  ell(c, 8, 14, 5, 1, SHADOW);
  ellOut(c, 8, 10, 5, 4.5, '#f6c7d0', '#b97a88');
  rect(c, 6, 13, 4, 1, '#e8aab8');
  for (const x of [5, 7, 9, 11]) rect(c, x, 8, 1, 4, '#e6a3b3');
}

function leuchte(c: C, inner: string, core: string | null) {
  ell(c, 8, 30, 5, 1, SHADOW);
  rect(c, 6, 8, 1, 22, '#4a3424');
  rect(c, 9, 8, 1, 22, '#4a3424');
  rect(c, 7, 8, 2, 22, '#7a5a3a');
  rect(c, 5, 28, 6, 2, '#6e4b2c');
  rect(c, 7, 5, 7, 2, '#7a5a3a');
  rect(c, 12, 7, 1, 2, '#3a2418');
  ellOut(c, 12, 11.5, 3.5, 3, '#f6d2da', '#b97a88');
  ell(c, 12, 12.5, 2, 1.5, inner);
  if (core) rect(c, 12, 12, 1, 1, core);
}

function paintLeuchteAus(c: C) {
  leuchte(c, '#8c7f86', null);
}

function paintLeuchteAn(c: C, f: number) {
  leuchte(c, ['#ffe7a3', '#ffdf8a', '#ffeab0'][f % 3]!, '#fff8d8');
}

function paintSchein(c: C) {
  const g = c.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,214,140,0.6)');
  g.addColorStop(0.5, 'rgba(255,200,120,0.22)');
  g.addColorStop(1, 'rgba(255,190,110,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
}

function paintGlitzer(c: C, f: number) {
  const s = [1, 2, 3, 2][f % 4]!;
  rect(c, 4 - s, 4, s * 2 + 1, 1, '#fffbe6');
  rect(c, 4, 4 - s, 1, s * 2 + 1, '#fffbe6');
  rect(c, 4, 4, 1, 1, '#ffffff');
}

function paintZiel(c: C) {
  ring(c, 8, 4, 7, 3.2, 'rgba(255,255,255,0.85)');
}

function paintSpritzer(c: C, f: number) {
  const spread = 2 + f * 2;
  for (const [dx, dy] of [[-spread, 0], [spread, 0], [-spread / 2, -1 - f], [spread / 2, -1 - f]] as const) {
    rect(c, 8 + dx, 5 + dy, 1, 1, '#e8f8ff');
  }
  if (f === 0) rect(c, 7, 3, 2, 2, '#e8f8ff');
}

function paintPortrait(c: C, who: string) {
  const bgs: Record<string, string> = {
    schnabbi: '#dff2e8',
    prinzessin: '#efe2f6',
    rosie: '#fbe3ec',
    bubbles: '#e0eefb',
    meerkat: '#f6ecd6',
    squichy: '#e4ecf2',
    chamaron: '#e6f2dc',
    beano: '#eef6e2',
    beani: '#eef6e2',
    beanz: '#eef6e2',
    bean: '#f2e8dc',
  };
  const bg = bgs[who] ?? '#f3e3cc';
  rect(c, 2, 0, 60, 64, bg);
  rect(c, 0, 2, 64, 60, bg);
  if (who === 'chamaron') {
    ellOut(c, 30, 38, 18, 15, '#a8d890', '#4f6b40');
    for (const x of [18, 24, 30, 36]) rect(c, x, 22, 3, 4, '#4f6b40');
    ellOut(c, 38, 34, 7, 7, '#f6f6e8', '#4f6b40');
    rect(c, 39, 33, 3, 3, EYE);
    rect(c, 22, 44, 12, 2, '#4f6b40');
    return;
  }
  if (who === 'beano' || who === 'beani' || who === 'beanz') {
    ellOut(c, 32, 34, 18, 18, '#8cc65a', '#3f6e25');
    ell(c, 25, 26, 5, 3, '#b4e08a');
    if (who === 'beani') {
      rect(c, 22, 34, 6, 2, EYE);
      rect(c, 36, 34, 6, 2, EYE);
      rect(c, 29, 42, 6, 1, '#3f6e25');
    } else {
      rect(c, 23, 31, 3, 5, EYE);
      rect(c, 38, 31, 3, 5, EYE);
      if (who === 'beano') {
        rect(c, 26, 41, 12, 2, '#3f6e25');
        rect(c, 24, 39, 2, 2, '#3f6e25');
        rect(c, 38, 39, 2, 2, '#3f6e25');
      } else {
        ellOut(c, 32, 42, 2, 2, '#3f6e25', '#3f6e25');
        rect(c, 46, 14, 3, 6, '#f2c14e'); // kleines Fragezeichen-Strichlein als Neugier (keine Schrift)
        rect(c, 46, 22, 3, 3, '#f2c14e');
      }
    }
    return;
  }
  if (who === 'bean') {
    for (const [x, y, w, h] of [[16, 6, 3, 14], [10, 6, 9, 3], [44, 6, 3, 14], [44, 6, 9, 3]] as const) rect(c, x, y, w, h, '#c8a878');
    ellOut(c, 32, 38, 16, 17, '#9a6a48', '#4a3020');
    ell(c, 32, 46, 9, 7, '#e8d2b0');
    rect(c, 24, 32, 3, 4, EYE);
    rect(c, 37, 32, 3, 4, EYE);
    ellOut(c, 32, 44, 3, 2.5, '#3a2a20', '#3a2a20');
    return;
  }
  if (who === 'meerkat') {
    ellOut(c, 20, 20, 4, 4, '#8a6a40', '#5a4128');
    ellOut(c, 44, 20, 4, 4, '#8a6a40', '#5a4128');
    ellOut(c, 32, 36, 15, 17, '#c9a46c', '#5a4128');
    ell(c, 32, 44, 8, 7, '#e8d2a6');
    ell(c, 25, 32, 4, 4, '#5a4128');
    ell(c, 39, 32, 4, 4, '#5a4128');
    rect(c, 24, 31, 2, 3, EYE);
    rect(c, 38, 31, 2, 3, EYE);
    rect(c, 30, 41, 4, 3, EYE);
    return;
  }
  if (who === 'squichy') {
    ellOut(c, 32, 36, 20, 17, '#c3ccd4', '#4f5a66');
    rect(c, 22, 30, 5, 6, EYE);
    rect(c, 37, 30, 5, 6, EYE);
    rect(c, 22, 30, 2, 2, '#ffffff');
    rect(c, 37, 30, 2, 2, '#ffffff');
    rect(c, 29, 40, 6, 3, '#3d4a55');
    for (const y of [41, 44]) {
      rect(c, 14, y, 10, 1, '#9aa6b2');
      rect(c, 40, y, 10, 1, '#9aa6b2');
    }
    return;
  }
  if (who === 'rosie' || who === 'bubbles') {
    const col = who === 'bubbles' ? { body: '#8fc4ef', gill: '#4f7fd0', out: '#2f4f7a' } : { body: '#f4a6c1', gill: '#d9547f', out: '#7a2f4a' };
    for (const [x, y] of [[10, 22], [8, 32], [10, 42], [50, 22], [52, 32], [50, 42]] as const) ellOut(c, x, y, 4, 3, col.gill, col.out);
    ellOut(c, 30, 36, 19, 15, col.body, col.out);
    rect(c, 22, 32, 3, 4, EYE);
    rect(c, 36, 32, 3, 4, EYE);
    rect(c, 26, 42, 8, 1, col.out);
    rect(c, 25, 41, 1, 1, col.out);
    rect(c, 34, 41, 1, 1, col.out);
    if (who === 'bubbles') {
      ring(c, 52, 12, 5, 5, '#ffffff');
      ring(c, 44, 6, 3, 3, '#ffffff');
    }
    return;
  }
  if (who === 'prinzessin') {
    ellOut(c, 19, 23, 4, 4, '#9a6a48');
    ellOut(c, 45, 23, 4, 4, '#9a6a48');
    ellOut(c, 32, 38, 17, 15, '#9a6a48');
    ell(c, 33, 44, 9, 6, COOKIE);
    rect(c, 25, 34, 3, 4, EYE);
    rect(c, 39, 34, 3, 4, EYE);
    rect(c, 31, 40, 5, 3, EYE);
    // Krone
    rect(c, 22, 16, 20, 6, '#f2c14e');
    for (const x of [22, 30, 38]) rect(c, x, 11, 4, 5, '#f2c14e');
    rect(c, 31, 17, 2, 2, '#e86a8a');
    // Kragen vom Kleid
    rect(c, 18, 56, 28, 6, '#b98ad0');
    return;
  }
  if (who === 'schnabbi') {
    ellOut(c, 30, 38, 18, 14, MINT, MINT_OUT);
    ell(c, 30, 25, 14, 3, '#f8f0dc');
    ell(c, 23, 42, 4, 2.5, '#f2b8c6');
    ellOut(c, 49, 41, 12, 5, '#9fb3c4', MINT_OUT);
    rect(c, 45, 41, 6, 1, '#3d4a55');
    rect(c, 36, 32, 3, 3, EYE);
  } else {
    ellOut(c, 19, 23, 4, 4, FUR);
    ellOut(c, 45, 23, 4, 4, FUR);
    ellOut(c, 32, 37, 17, 15, FUR);
    ell(c, 33, 43, 9, 6, COOKIE);
    rect(c, 25, 33, 3, 4, EYE);
    rect(c, 39, 33, 3, 4, EYE);
    rect(c, 31, 39, 5, 3, EYE);
  }
}

/** Zeichnet einen Frame des Platzhalters in einen (bereits verschobenen) Kontext. */
export function paintFrame(c: C, def: SpriteDef, frame: number): void {
  const args = def.placeholder.args ?? {};
  const painters: Record<PainterId, () => void> = {
    otter: () => paintOtter(c, frame, String(args.state), String(args.dir)),
    schnabbi: () => paintSchnabbi(c, frame, String(args.state), String(args.dir)),
    bau: () => paintBau(c),
    werkbank: () => paintWerkbank(c),
    wegweiser: () => paintWegweiser(c),
    schilfhalm: () => paintSchilfhalm(c),
    schilfmatte: () => paintSchilfmatte(c),
    bank: () => paintBank(c),
    windspiel: () => paintWindspiel(c, frame),
    hinweis: () => paintHinweis(c),
    treibholz: () => paintTreibholz(c),
    treibholzTreibend: () => paintTreibholzTreibend(c, frame),
    muschel: () => paintMuschel(c),
    leuchteAus: () => paintLeuchteAus(c),
    leuchteAn: () => paintLeuchteAn(c, frame),
    schein: () => paintSchein(c),
    glitzer: () => paintGlitzer(c, frame),
    ziel: () => paintZiel(c),
    spritzer: () => paintSpritzer(c, frame),
    portrait: () => paintPortrait(c, String(args.who)),
    prinzessin: () => paintPrinzessin(c, frame, String(args.state), String(args.dir)),
    axolotl: () => paintAxolotl(c, frame, String(args.dir), String(args.farbe)),
    picknickdecke: () => paintPicknickdecke(c),
    bastelstumpf: () => paintBastelstumpf(c),
    wiesenbluete: () => paintWiesenbluete(c),
    glitzerkiesel: () => paintGlitzerkiesel(c),
    seerosenblatt: () => paintSeerosenblatt(c, frame),
    bluetengirlande: () => paintBluetengirlande(c),
    seerosenkissen: () => paintSeerosenkissen(c),
    kiesellicht: () => paintKiesellicht(c, frame, args.an === true),
    blase: () => paintBlase(c),
    meerkat: () => paintMeerkat(c, frame, String(args.state), String(args.dir)),
    squichy: () => paintSquichy(c, frame, String(args.state), String(args.dir)),
    aussichtsstein: () => paintAussichtsstein(c, args.wimpel === true),
    feder: () => paintFeder(c),
    sonnenblume: () => paintSonnenblume(c),
    federwimpel: () => paintFederwimpel(c, frame),
    schilfball: () => paintSchilfball(c),
    sonnenblumentopf: () => paintSonnenblumentopf(c),
    chamaron: () => paintChamaron(c, frame, String(args.state), String(args.dir)),
    erbsenschale: () => paintErbsenschale(c, frame, String(args.state), String(args.dir)),
    bean: () => paintBean(c, frame, String(args.state), String(args.dir)),
    theke: () => paintTheke(c),
    basteltisch: () => paintBasteltisch(c),
    cafetisch: () => paintCafetisch(c),
    katze: () => paintKatze(c, frame, String(args.farbe)),
    zimmerpflanze: () => paintZimmerpflanze(c),
    kochtopf: () => paintKochtopf(c, frame),
    hotpottisch: () => paintHotpottisch(c),
    laterne: () => paintLaterne(c),
    fuchsbauhuegel: () => paintFuchsbauhuegel(c),
    teepflanze: () => paintTeepflanze(c),
    wollfaden: () => paintWollfaden(c),
    mehlsack: () => paintMehlsack(c),
    gemuesekiste: () => paintGemuesekiste(c),
    kraeutertopf: () => paintKraeutertopf(c),
    tannenzapfen: () => paintTannenzapfen(c),
    beerenstrauch: () => paintBeerenstrauch(c),
    moos: () => paintMoos(c),
    kletterpflanze: () => paintKletterpflanze(c),
    wollkissen: () => paintWollkissen(c),
    teigtaschen: () => paintTeigtaschen(c, frame),
    kraeutersuppe: () => paintKraeutersuppe(c, frame),
    zapfenkranz: () => paintZapfenkranz(c),
    beerenlicht: () => paintBeerenlicht(c, frame, args.an === true),
    mooskissen: () => paintMooskissen(c),
  };
  painters[def.placeholder.painter]();
}

/** Ein Streifen aller Frames als Canvas. */
export function placeholderCanvas(def: SpriteDef): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = def.frameW * def.frames;
  canvas.height = def.frameH;
  const c = canvas.getContext('2d')!;
  c.imageSmoothingEnabled = false;
  for (let i = 0; i < def.frames; i++) {
    c.save();
    c.translate(i * def.frameW, 0);
    c.beginPath();
    c.rect(0, 0, def.frameW, def.frameH);
    c.clip();
    paintFrame(c, def, i);
    c.restore();
  }
  return canvas;
}

// ---------------- Boden ----------------

const hash = (x: number, y: number, i: number) => (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(i, 83492791)) >>> 0;

/** Zeichnet den ganzen Boden einer Map (Platzhalter für den Kachelbogen tiles.ufer). frame 0/1 = Wasseranimation. */
export function paintTerrain(grid: Grid, frame: number): HTMLCanvasElement {
  const T = 16;
  const canvas = document.createElement('canvas');
  canvas.width = grid.w * T;
  canvas.height = grid.h * T;
  const c = canvas.getContext('2d')!;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= grid.w || y >= grid.h ? null : grid.cells[y * grid.w + x]!);
  const landish = (t: string | null) => t === 'sand' || t === 'grass' || t === 'blumen' || t === 'blocked';

  for (let y = 0; y < grid.h; y++) {
    for (let x = 0; x < grid.w; x++) {
      const t = at(x, y)!;
      const px = x * T;
      const py = y * T;
      const h = hash(x, y, 1);
      if (t === 'boden') {
        // Holzdielen (Innenräume)
        // Lange Dielen von links nach rechts, abwechselnd heller und dunkler, selten eine Stoßfuge.
        for (let row = 0; row < 2; row++) {
          const shade = (y * 2 + row) % 2 === 0 ? '#c89a6a' : '#bd8f5f';
          rect(c, px, py + row * 8, T, 8, shade);
          rect(c, px, py + row * 8 + 7, T, 1, '#9a6e44');
          if (hash(x, y, row + 50) % 5 === 0) rect(c, px + (hash(x, y, row + 60) % 14) + 1, py + row * 8, 1, 7, '#9a6e44');
        }
        if ((h >> 3) % 6 === 0) rect(c, px + (h % 12) + 2, py + 2 + ((h >> 6) % 4), 3, 1, '#d8ae80');
        continue;
      }
      if (t === 'wand') {
        // Wand: von oben dunkle Mauerkrone, zur Raumseite hin eine helle Wand mit Holzleiste
        const below = at(x, y + 1);
        if (below && below !== 'wand') {
          rect(c, px, py, T, T, '#f1e2c6');
          rect(c, px, py + 11, T, 5, '#b5835a');
          rect(c, px, py + 11, T, 1, '#8a5a36');
          if (h % 4 === 0) {
            // kleines Fenster
            rect(c, px + 3, py + 2, 10, 7, '#5a3c22');
            rect(c, px + 4, py + 3, 8, 5, '#9fc8de');
            rect(c, px + 8, py + 3, 1, 5, '#5a3c22');
          }
        } else {
          rect(c, px, py, T, T, '#6e4a32');
          rect(c, px, py, T, 1, '#8a6246');
        }
        continue;
      }
      if (t === 'schilf') {
        // Schilf steht im flachen Wasser: Wasser darunter, Halme und Kolben darüber.
        rect(c, px, py, T, T, '#3f7f98');
        for (let i = 0; i < 7; i++) {
          const s = hash(x, y, i + 20);
          const sx = px + (s % 15);
          const top = py + ((s >> 4) % 6);
          rect(c, sx + (frame && i % 3 === 0 ? 1 : 0), top, 1, T - (top - py), i % 2 ? '#6f8f3e' : '#86a84c');
          if (i % 3 === 0) rect(c, sx, top, 1, 3, '#7a4f2c');
        }
        continue;
      }
      if (t === 'pfad') {
        rect(c, px, py, T, T, '#b8956a');
        for (let i = 0; i < 5; i++) {
          const s = hash(x, y, i + 30);
          rect(c, px + (s % 15), py + ((s >> 4) % 15), 2, 1, i % 2 ? '#a3825a' : '#cfae84');
        }
        const grassy = (n: string | null) => n === 'grass' || n === 'blocked';
        if (grassy(at(x, y - 1))) for (let i = 0; i < T; i += 2) rect(c, px + i + (h % 2), py, 1, 1, '#76a453');
        if (grassy(at(x, y + 1))) for (let i = 0; i < T; i += 2) rect(c, px + i + ((h >> 1) % 2), py + T - 1, 1, 1, '#76a453');
        continue;
      }
      if (t === 'water' || t === 'steg') {
        rect(c, px, py, T, T, '#3d86a8');
        const hx = (h % 9) + 2 + (frame ? 2 : 0);
        const hy = ((h >> 5) % 10) + 3;
        rect(c, px + hx, py + hy, 3, 1, '#6fb7d4');
        if ((h >> 9) % 3 === 0) rect(c, px + ((hx + 7) % 13), py + ((hy + 6) % 13), 2, 1, '#5fa6c6');
        // Schaum an der Uferkante
        const foam = '#dff4fa';
        if (landish(at(x, y - 1))) for (let i = 0; i < T; i++) if ((i + frame) % 3 !== 0) rect(c, px + i, py, 1, 1, foam);
        if (landish(at(x, y + 1))) for (let i = 0; i < T; i++) if ((i + frame) % 3 !== 0) rect(c, px + i, py + T - 1, 1, 1, foam);
        if (landish(at(x - 1, y))) for (let i = 0; i < T; i++) if ((i + frame) % 3 !== 0) rect(c, px, py + i, 1, 1, foam);
        if (landish(at(x + 1, y))) for (let i = 0; i < T; i++) if ((i + frame) % 3 !== 0) rect(c, px + T - 1, py + i, 1, 1, foam);
        const across = t === 'steg' && (at(x - 1, y) === 'steg' || at(x + 1, y) === 'steg');
        if (t === 'steg' && across) {
          // Querbrücke: durchgehende Bohlen von links nach rechts
          rect(c, px, py + 2, T, 12, '#a6784a');
          rect(c, px, py + 2, T, 1, '#5a3c22');
          rect(c, px, py + 13, T, 1, '#5a3c22');
          for (const gx of [3, 7, 11, 15]) rect(c, px + gx, py + 3, 1, 10, '#6b4a2b');
        } else if (t === 'steg') {
          rect(c, px + 2, py, 12, T, '#a6784a');
          rect(c, px + 2, py, 1, T, '#5a3c22');
          rect(c, px + 13, py, 1, T, '#5a3c22');
          for (const gy of [3, 7, 11, 15]) rect(c, px + 3, py + gy, 10, 1, '#6b4a2b');
          if (at(x, y - 1) !== 'steg') rect(c, px + 2, py, 12, 1, '#5a3c22');
        }
        continue;
      }
      if (t === 'sand') {
        rect(c, px, py, T, T, '#e3c995');
        for (let i = 0; i < 5; i++) {
          const s = hash(x, y, i + 2);
          rect(c, px + (s % 16), py + ((s >> 4) % 16), 1, 1, '#cdb07a');
        }
        const wet = '#cbb07c';
        if (at(x, y - 1) === 'water') rect(c, px, py, T, 2, wet);
        if (at(x, y + 1) === 'water') rect(c, px, py + T - 2, T, 2, wet);
        if (at(x - 1, y) === 'water') rect(c, px, py, 2, T, wet);
        if (at(x + 1, y) === 'water') rect(c, px + T - 2, py, 2, T, wet);
        continue;
      }
      // Gras und Büsche
      rect(c, px, py, T, T, '#76a453');
      for (let i = 0; i < 4; i++) {
        const s = hash(x, y, i + 7);
        const gx = px + (s % 14) + 1;
        const gy = py + ((s >> 4) % 13) + 2;
        rect(c, gx, gy, 1, 2, i % 2 ? '#5f8c42' : '#8fbe68');
      }
      if (at(x, y - 1) === 'sand') for (let i = 0; i < T; i += 2) rect(c, px + i + (h % 2), py, 1, 1, '#e3c995');
      if (t === 'blocked') {
        ellOut(c, px + 8, py + 9, 7, 6, '#4d7d38', '#2e4c22');
        ell(c, px + 6, py + 7, 3, 2, '#679a4c');
      }
      if (t === 'zaun') {
        // Holzzaun: Pfosten und Latten in Richtung der Nachbar-Zaunkacheln
        const z = (dx: number, dy: number) => at(x + dx, y + dy) === 'zaun';
        if (z(-1, 0) || z(1, 0) || !(z(0, -1) || z(0, 1))) {
          rect(c, px, py + 6, T, 2, '#a6784a');
          rect(c, px, py + 11, T, 2, '#a6784a');
        }
        if (z(0, -1) || z(0, 1)) rect(c, px + 7, py, 2, T, '#a6784a');
        rect(c, px + 6, py + 3, 4, 12, '#7a5232');
        rect(c, px + 6, py + 3, 4, 1, '#c09468');
      }
      if (t === 'blumen') {
        // Blumenwiese: ein paar bunte Tupfen
        const cols = ['#f2a0c0', '#f5d76e', '#c9a0e8', '#fbf1e6'];
        for (let i = 0; i < 5; i++) {
          const s = hash(x, y, i + 40);
          rect(c, px + (s % 14) + 1, py + ((s >> 4) % 14) + 1, 2, 2, cols[(s >> 8) % cols.length]!);
        }
      }
    }
  }
  return canvas;
}

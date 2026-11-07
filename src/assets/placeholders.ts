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

// ---------------- Umgebung und Dinge ----------------

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
  const bg = who === 'schnabbi' ? '#dff2e8' : '#f3e3cc';
  rect(c, 2, 0, 60, 64, bg);
  rect(c, 0, 2, 64, 60, bg);
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
  const landish = (t: string | null) => t === 'sand' || t === 'grass' || t === 'blocked';

  for (let y = 0; y < grid.h; y++) {
    for (let x = 0; x < grid.w; x++) {
      const t = at(x, y)!;
      const px = x * T;
      const py = y * T;
      const h = hash(x, y, 1);
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
        if (t === 'steg') {
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
    }
  }
  return canvas;
}

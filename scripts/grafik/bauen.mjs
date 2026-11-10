// Baut Spielgrafiken aus den freigegebenen Codex-Entwürfen (otter-design/arbeit, nur lesend).
// Aufruf: node scripts/grafik/bauen.mjs [vorschau-ordner]
// Ergebnis: PNG-Streifen unter public/art/ (Maße passend zu src/assets/catalog.ts) und ein Kontaktblatt.
import { resolve } from 'node:path';
import { DESIGN, PUBLIC, openPixelPage } from './browser.mjs';

const SRC = {
  otter: 'quellen/otter-design/referenzen/stil/starter-otter.png',
  lampe: 'quellen/otter-design/referenzen/stil/muschellampe.png',
  schnabbi: 'paket-01/entwuerfe/schnabbi-entwurf-v1.png',
  squichy: 'paket-01/entwuerfe/squichy-entwurf-v3.png',
  dinge: 'paket-03-ui-ausbau/entwuerfe/02-gegenstaende-atlas.png',
  navi: 'paket-03-ui-ausbau/entwuerfe/01-navigation-atlas.png',
  moebel: 'paket-05-bau-bausteine/quellen/moebel-v2.png',
  architektur: 'paket-05-bau-bausteine/quellen/architektur-v1.png',
  ufer: 'quellen/otter-design/referenzen/stil/startufer.png',
};

/** Ein gemeinsamer Maßstab für Figuren: Quellpixel je Weltpixel beim Starter-Otter. */
const OTTER = 13.5;

// Teile: Ausschnitt aus einem Entwurf, verkleinert auf Weltpixel.
const parts = [
  { id: 'otter.steht', src: 'otter', rect: [60, 160, 590, 430], w: Math.round(560 / OTTER) },
  { id: 'otter.laeuft', src: 'otter', rect: [660, 215, 760, 345], w: Math.round(732 / OTTER) },
  { id: 'otter.treibt', src: 'otter', rect: [1500, 175, 600, 400], w: Math.round(576 / OTTER) },
  { id: 'schnabbi', src: 'schnabbi', rect: [60, 180, 1600, 600], w: 58 },
  { id: 'squichy', src: 'squichy', rect: [260, 220, 1010, 640], w: 30 },
  { id: 'leuchte.aus', src: 'lampe', rect: [100, 640, 470, 580], h: 40 },
  { id: 'leuchte.an', src: 'lampe', rect: [700, 640, 470, 580], h: 40 },
  { id: 'muschel', src: 'dinge', rect: [610, 130, 300, 260], w: 13 },
  { id: 'treibholz', src: 'dinge', rect: [100, 125, 345, 265], w: 16 },
  { id: 'kiesel', src: 'dinge', rect: [655, 690, 225, 175], w: 11 },
  { id: 'werkbank', src: 'navi', rect: [645, 55, 275, 245], w: 34 },
  { id: 'matte', src: 'moebel', rect: [465, 120, 400, 250], w: 24 },
  { id: 'cafetisch', src: 'moebel', rect: [930, 125, 350, 250], w: 28 },
  { id: 'pflanze', src: 'moebel', rect: [960, 500, 300, 330], h: 24 },
  { id: 'vase', src: 'moebel', rect: [1430, 515, 240, 300], h: 14 },
  { id: 'fuchsbau', src: 'architektur', rect: [35, 30, 460, 450], h: 38 },
  // Porträts: Kopf und Brust aus den großen Entwürfen
  { id: 'portrait.otter', src: 'otter', rect: [300, 150, 330, 330], h: 56 },
  { id: 'portrait.schnabbi', src: 'schnabbi', rect: [960, 200, 720, 600], w: 60 },
  { id: 'portrait.squichy', src: 'squichy', rect: [560, 220, 720, 640], w: 58 },
  {
    id: 'bau',
    src: 'ufer',
    rect: [30, 220, 480, 290],
    w: 68,
    // Umriss in Quellpixeln: Hügel mit Moosdach, Wurzeln links, Fenster rechts – ohne Weidenblätter und Tisch
    poly: [[62, 505], [38, 455], [52, 400], [68, 340], [98, 292], [148, 252], [220, 234], [300, 230], [378, 238], [438, 258], [478, 290], [498, 330], [484, 356], [404, 360], [372, 372], [360, 400], [352, 468], [330, 505]],
  },
];

// Abgeleitete Teile: Lumi (Otterprinzessin, Vorschlag) = Codex-Otter mit honigfarbenem Fell und kleiner Krone.
const derived = [
  { id: 'lumi.steht', from: 'otter.steht', hsl: [8, 0.06, 0.07] },
  { id: 'lumi.laeuft', from: 'otter.laeuft', hsl: [8, 0.06, 0.07] },
  { id: 'lumi.treibt', from: 'otter.treibt', hsl: [8, 0.06, 0.07] },
  { id: 'portrait.lumi', from: 'portrait.otter', hsl: [8, 0.06, 0.07] },
];
const stamps = {
  kroneGross: {
    rows: ['..o...o...o..', '.oyo.oyo.oyo.', '.oyyoyyyoyyo.', '.oyyyyyyyyyo.', '.oyyyypyyyyo.', '.oYYYYYYYYYo.', '..ooooooooo..'],
    cols: { o: '#4a2e20', y: '#f4d264', Y: '#d6a23a', p: '#e8708f' },
  },
  welle1: { rows: ['ww............ww', '..wwwwWWWWwwww..'], cols: { w: '#6fcab5', W: '#a9e3d2' } },
  welle2: { rows: ['.ww..........ww.', '...wwwWWWWwww...'], cols: { w: '#6fcab5', W: '#a9e3d2' } },
  krone: {
    rows: ['.o.o.o.', 'oyoyoyo', 'oyypyyo', 'oYYYYYo', '.ooooo.'],
    cols: { o: '#4a2e20', y: '#f4d264', Y: '#d6a23a', p: '#e8708f' },
  },
};
/** Krone je Pose: Lage relativ zur linken oberen Ecke des Teils (an Kopfoberkante). */
const KRONE = { 'lumi.steht': [26, -3], 'lumi.laeuft': [40, -3], 'lumi.treibt': [31, -1] };

/**
 * Ausgaben: Datei, Frame-Größe, Frames (Liste von Teilen mit Lage). Lage über den Bodenanker:
 * `at: [ax, ay]` setzt die Unterkante-Mitte des Teils auf diesen Punkt (plus `dy` je Frame).
 * `stamp: [name, dx, dy]` setzt ein Pixelbildchen relativ zur linken oberen Ecke des Teils dazu.
 */
const lumi = (id, at, sy = 0) => ({ id, at, sy, stamp: ['krone', ...KRONE[id]] });
/** Lumis Kleid (Masterprompt: „trägt Kleid und Krone“): Umriss je Pose in Frame-Koordinaten des ersten Frames. */
const KLEID = {
  steht: [[22, 26], [29, 23], [37, 24], [44, 26], [46, 33], [43, 37], [24, 37], [21, 33]],
  laeuft: [[18, 27], [25, 24], [38, 24], [43, 27], [45, 33], [41, 36], [20, 36], [17, 32]],
  treibt: [[15, 35], [23, 30], [33, 29], [40, 31], [43, 37], [37, 41], [22, 41], [15, 39]],
};
const ROSA = ['#a84d6f', '#d4708f', '#ec94ae', '#f8c2d2'];
const shift = (poly, dy) => poly.map(([x, y]) => [x, y + dy]);
const outputs = [
  { file: 'art/characters/otterprinzessin/idle-se.png', w: 64, h: 48, ramp: ROSA, dress: [KLEID.steht, shift(KLEID.steht, 1)], frames: [lumi('lumi.steht', [32, 41]), lumi('lumi.steht', [32, 41], 1)] },
  { file: 'art/characters/otterprinzessin/walk-se.png', w: 64, h: 48, ramp: ROSA, dress: [0, -1, 0, -1].map((dy) => shift(KLEID.laeuft, dy)), frames: [0, -1, 0, -1].map((dy) => lumi('lumi.laeuft', [32, 41 + dy])) },
  { file: 'art/characters/otterprinzessin/swim-se.png', w: 64, h: 48, ramp: ROSA, dress: [0, 1, 1, 0].map((dy) => shift(KLEID.treibt, dy)), frames: [0, 1, 1, 0].map((dy) => lumi('lumi.treibt', [32, 44 + dy])) },
  { file: 'art/characters/otter/idle-se.png', w: 64, h: 48, frames: [{ id: 'otter.steht', at: [32, 41] }, { id: 'otter.steht', at: [32, 41], sy: 1 }] },
  { file: 'art/characters/otter/walk-se.png', w: 64, h: 48, frames: [0, -1, 0, -1].map((dy) => ({ id: 'otter.laeuft', at: [32, 41 + dy] })) },
  { file: 'art/characters/otter/swim-se.png', w: 64, h: 48, frames: [0, 1, 1, 0].map((dy) => ({ id: 'otter.treibt', at: [32, 44 + dy] })) },
  { file: 'art/characters/schnabbi/idle-se.png', w: 88, h: 48, frames: [{ id: 'schnabbi', at: [44, 41] }, { id: 'schnabbi', at: [44, 41], sy: 1 }] },
  { file: 'art/characters/schnabbi/walk-se.png', w: 88, h: 48, frames: [0, -1, 0, -1].map((dy) => ({ id: 'schnabbi', at: [44, 41 + dy] })) },
  { file: 'art/characters/squichy/idle-se.png', w: 48, h: 48, frames: [{ id: 'squichy', at: [24, 41] }, { id: 'squichy', at: [24, 41], sy: 1 }] },
  { file: 'art/characters/squichy/walk-se.png', w: 48, h: 48, frames: [0, -1, 0, -1].map((dy) => ({ id: 'squichy', at: [24, 41 + dy] })) },
  { file: 'art/deco/uferleuchte-aus.png', w: 32, h: 48, frames: [{ id: 'leuchte.aus', at: [16, 47] }] },
  { file: 'art/deco/uferleuchte-an.png', w: 32, h: 48, frames: [{ id: 'leuchte.an', at: [16, 47] }] },
  { file: 'art/items/muschelschale.png', w: 16, h: 16, frames: [{ id: 'muschel', at: [8, 15] }] },
  { file: 'art/items/treibholz.png', w: 16, h: 16, frames: [{ id: 'treibholz', at: [8, 15] }] },
  { file: 'art/items/treibholz-treibend.png', w: 16, h: 16, frames: [{ id: 'treibholz', at: [8, 13], stamp: ['welle1', 0, 10] }, { id: 'treibholz', at: [8, 14], stamp: ['welle2', 0, 9] }] },
  { file: 'art/items/glitzerkiesel.png', w: 16, h: 16, frames: [{ id: 'kiesel', at: [8, 15] }] },
  { file: 'art/objects/werkbank.png', w: 40, h: 32, frames: [{ id: 'werkbank', at: [20, 31] }] },
  { file: 'art/deco/schilfmatte.png', w: 24, h: 16, frames: [{ id: 'matte', at: [12, 15] }] },
  { file: 'art/objects/cafetisch.png', w: 32, h: 24, frames: [{ id: 'cafetisch', at: [16, 23] }] },
  { file: 'art/objects/zimmerpflanze.png', w: 24, h: 32, frames: [{ id: 'pflanze', at: [12, 31] }] },
  { file: 'art/objects/fuchsbau.png', w: 48, h: 40, frames: [{ id: 'fuchsbau', at: [24, 39] }] },
  { file: 'art/portraits/otter.png', w: 64, h: 64, frames: [{ id: 'portrait.otter', at: [32, 62] }] },
  { file: 'art/portraits/otterprinzessin.png', w: 64, h: 64, ramp: ROSA, dress: [[[0, 44], [16, 42], [30, 46], [40, 54], [42, 64], [0, 64]]], frames: [{ id: 'portrait.lumi', at: [32, 62], stamp: ['kroneGross', 24, -3] }] },
  { file: 'art/portraits/schnabbi.png', w: 64, h: 64, frames: [{ id: 'portrait.schnabbi', at: [32, 60] }] },
  { file: 'art/portraits/squichy.png', w: 64, h: 64, frames: [{ id: 'portrait.squichy', at: [32, 60] }] },
  { file: 'art/objects/bau.png', w: 80, h: 64, outline: '#4a3428', frames: [{ id: 'bau', at: [40, 62] }] },
];

const preview = process.argv[2];
const px = await openPixelPage();
for (const [name, rel] of Object.entries(SRC)) await px.load(name, resolve(DESIGN, rel));
const sizes = {};
for (const p of parts) {
  const r = await px.run((spec) => window.G.sprite(spec), p);
  sizes[p.id] = r;
  console.log(`${p.id.padEnd(14)} ${r.w} × ${r.h}`);
}
for (const d of derived) {
  await px.run(([a, b, h]) => window.G.hsl(a, b, ...h), [d.from, d.id, d.hsl]);
  sizes[d.id] = sizes[d.from];
}
for (const [name, s] of Object.entries(stamps)) sizes[`stamp.${name}`] = await px.run(([n, r, c]) => window.G.pix(n, r, c), [`stamp.${name}`, s.rows, s.cols]);
for (const o of outputs) {
  const frames = o.frames.map((f) => {
    const s = sizes[f.id];
    const x = Math.round(f.at[0] - s.w / 2);
    const y = f.at[1] - s.h;
    const list = [{ id: f.id, x, y, sy: f.sy ?? 0 }];
    if (f.stamp) list.push({ id: `stamp.${f.stamp[0]}`, x: x + f.stamp[1], y: y + f.stamp[2] + (f.sy ?? 0) });
    return list;
  });
  const url = await px.run((spec) => window.G.strip(spec), { w: o.w, h: o.h, frames, outline: o.outline, dress: o.dress, ramp: o.ramp });
  px.writePng(resolve(PUBLIC, o.file), url);
}
if (preview) {
  // Kontaktblatt: alle Teile 5-fach auf Gras, Sand und Wasser
  const url = await px.run((ids) => {
    const S = 5;
    const items = ids.map((id) => window.G.part[id]);
    const W = 1400;
    let x = 10, y = 10, rowH = 0;
    const pos = [];
    for (const p of items) {
      if (x + p.width * S + 10 > W) {
        x = 10;
        y += rowH + 10;
        rowH = 0;
      }
      pos.push([x, y]);
      x += p.width * S + 14;
      rowH = Math.max(rowH, p.height * S);
    }
    const c = document.createElement('canvas');
    c.width = W;
    c.height = y + rowH + 10;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const bgs = ['#8db84f', '#e2bd85', '#2f9e96'];
    items.forEach((p, i) => {
      const [px0, py0] = pos[i];
      g.fillStyle = bgs[i % 3];
      g.fillRect(px0 - 4, py0 - 4, p.width * S + 8, p.height * S + 8);
      g.drawImage(p, px0, py0, p.width * S, p.height * S);
    });
    return c.toDataURL('image/png');
  }, parts.map((p) => p.id));
  px.writePng(resolve(preview, 'kontaktblatt.png'), url);
}
await px.close();

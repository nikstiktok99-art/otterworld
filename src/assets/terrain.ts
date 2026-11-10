// Boden im Stil der Codex-Entwürfe (Referenz „Startufer“, Paket 02–05): olivgelbes Gras mit dunklen Grasbüscheln,
// türkises Wasser mit hellen Wellenstrichen, warmer Sandweg, rosa-graue Ufersteine, Schilfkolben, Wiesenblumen,
// runde Büsche, Holzsteg mit Pfosten. Farben aus startufer.png gemessen (scripts/grafik/farben.mjs).
// Wird einmal pro Ort in zwei Bilder gemalt (Wasser und Schilf bewegen sich leicht).
import type { Grid } from '../game/space';

const T = 16;

export const BODEN = {
  gras: '#94a444',
  grasHell: '#9caa49',
  grasDunkel: '#8d9e42',
  halm: '#6a873f',
  halmDunkel: '#4c6b3b',
  halmHell: '#b8c058',
  sand: '#efcd96',
  sandHell: '#f7dcab',
  sandDunkel: '#dcb47c',
  sandNass: '#d3a874',
  pfad: '#eaa465',
  pfadHell: '#f5b97c',
  pfadDunkel: '#d38d5c',
  pfadStein: '#bf7d55',
  wasser: '#26968d',
  wasserTief: '#228d86',
  wasserHell: '#2b9e93',
  wasserUfer: '#3cab9a',
  welle: '#6fcab5',
  welleHell: '#a9e3d2',
  schaum: '#cdeedd',
  uferSchatten: '#1b726d',
  stein: '#a87c78',
  steinHell: '#d6a787',
  steinMitte: '#b98d7f',
  steinDunkel: '#806670',
  kontur: '#4b3438',
  holz: '#de8a52',
  holzHell: '#f6a65e',
  holzMitte: '#d27e4b',
  holzDunkel: '#b25e3d',
  holzKontur: '#6a3a25',
  busch: '#5d873c',
  buschHell: '#86a646',
  buschSpitze: '#b3bd55',
  buschDunkel: '#40693a',
  buschKontur: '#2d4b3b',
  kolben: '#d47a42',
  kolbenHell: '#f4a85c',
  beere: '#d4564c',
  diele: '#d98a52',
  dieleHell: '#e8a26b',
  dieleDunkel: '#c97a46',
  dieleFuge: '#87482b',
  lehm: '#f9dbae',
  lehmHell: '#fde7c6',
  lehmDunkel: '#f0cb98',
  wandKrone: '#6b4430',
  wandKroneHell: '#8a5a3c',
} as const;

const B = BODEN;
type Mat = 0 | 1 | 2 | 3 | 4 | 5; // Wasser, Gras, Sand, Pfad, Diele, Wand
const W = 0, G = 1, S = 2, P = 3, F = 4, X = 5;
const MAT: Record<string, Mat> = {
  water: W, schilf: W, steg: W,
  grass: G, blumen: G, blocked: G, zaun: G,
  sand: S, pfad: P, boden: F, wand: X,
};

const hash = (x: number, y: number, i: number) =>
  (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(i + 1, 83492791) ^ Math.imul(x ^ y, 2654435761)) >>> 0;
const rnd = (x: number, y: number, i: number) => (hash(x, y, i) % 100000) / 100000;

/** Weiches Wertrauschen 0..1 in Rasterweite `s` Pixel. */
function noise(x: number, y: number, s: number, seed: number): number {
  const gx = Math.floor(x / s), gy = Math.floor(y / s);
  const fx = x / s - gx, fy = y / s - gy;
  const sm = (t: number) => t * t * (3 - 2 * t);
  const a = rnd(gx, gy, seed), b = rnd(gx + 1, gy, seed), c = rnd(gx, gy + 1, seed), d = rnd(gx + 1, gy + 1, seed);
  const u = sm(fx), v = sm(fy);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const rgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] as const;

/** Kleine Pixelbilder: Buchstabe = Farbe, Punkt = frei. */
type Pix = { rows: string[]; cols: Record<string, string> };
function stamp(c: CanvasRenderingContext2D, x: number, y: number, p: Pix, flip = false) {
  const w = p.rows[0]!.length;
  p.rows.forEach((row, ry) => {
    for (let rx = 0; rx < w; rx++) {
      const ch = row[rx]!;
      if (ch === '.') continue;
      c.fillStyle = p.cols[ch]!;
      c.fillRect(x + (flip ? w - 1 - rx : rx), y + ry, 1, 1);
    }
  });
}

const TUFTS: Pix[] = [
  { rows: ['.d..d', '.d.dd', 'dDdD.'], cols: { d: B.halm, D: B.halmDunkel } },
  { rows: ['d..d.', '.d.d.', '.DdDd'], cols: { d: B.halm, D: B.halmDunkel } },
  { rows: ['..d..d.', 'd.d.dd.', '.dD.D.d', '.DDDDD.'], cols: { d: B.halm, D: B.halmDunkel } },
  { rows: ['.l.l', 'ldld', 'dDD.'], cols: { d: B.halm, D: B.halmDunkel, l: B.halmHell } },
];

const FLOWER_COLS = [
  { p: '#fdf6e6', m: '#f2c95a' }, // Gänseblümchen
  { p: '#f6b090', m: '#f2c95a' }, // Pfirsich
  { p: '#f5d46a', m: '#e08a52' }, // Butterblume
  { p: '#f3b3c3', m: '#fdf6e6' }, // Rosa
];
function flower(c: CanvasRenderingContext2D, x: number, y: number, k: number, leaves = true) {
  const col = FLOWER_COLS[k % FLOWER_COLS.length]!;
  if (leaves) stamp(c, x - 1, y + 2, { rows: ['g.g', '.g.', 'G.G'], cols: { g: B.halm, G: B.halmDunkel } });
  stamp(c, x - 1, y - 1, { rows: ['.p.', 'pmp', '.p.'], cols: { p: col.p, m: col.m } });
}

function ellipse(c: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, col: string) {
  c.fillStyle = col;
  for (let dy = -ry; dy <= ry; dy++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / ((ry + 0.35) * (ry + 0.35)))));
    if (half <= 0 && Math.abs(dy) === ry) continue;
    c.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1);
  }
}

/** Ufer- und Wegstein mit Kontur, Licht von oben links. */
function stone(c: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ellipse(c, cx, cy + 1, rx + 1, ry + 1, B.kontur);
  ellipse(c, cx, cy, rx, ry, B.stein);
  ellipse(c, cx - 1, cy - 1, Math.max(1, rx - 1), Math.max(1, ry - 1), B.steinMitte);
  ellipse(c, cx - Math.ceil(rx / 3), cy - Math.ceil(ry / 2), Math.max(1, Math.floor(rx / 2)), Math.max(0, Math.floor(ry / 3)), B.steinHell);
  c.fillStyle = B.steinDunkel;
  c.fillRect(Math.round(cx + rx - 2), Math.round(cy + ry - 1), 2, 1);
}

function bush(c: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number) {
  ellipse(c, cx + 1, cy + r - 1, r, 3, B.halmDunkel); // Schatten
  ellipse(c, cx, cy, r + 1, r, B.buschKontur);
  ellipse(c, cx, cy, r, r - 1, B.busch);
  ellipse(c, cx + 1, cy + 2, r - 2, r - 3, B.buschDunkel);
  ellipse(c, cx - 1, cy - 1, r - 2, r - 3, B.busch);
  ellipse(c, cx - 2, cy - 3, Math.max(2, r - 4), Math.max(1, r - 6), B.buschHell);
  // Blätter: kleine helle Tupfen oben links, dunkle unten rechts
  for (let i = 0; i < 7; i++) {
    const a = rnd(seed, i, 61) * Math.PI * 2;
    const d = rnd(seed, i, 62) * (r - 2);
    const x = Math.round(cx + Math.cos(a) * d);
    const y = Math.round(cy + Math.sin(a) * d * 0.9);
    c.fillStyle = y < cy - 1 ? B.buschSpitze : B.buschDunkel;
    c.fillRect(x, y, 2, 1);
  }
  if (rnd(seed, 3, 63) < 0.18) {
    for (let i = 0; i < 3; i++) {
      c.fillStyle = B.beere;
      c.fillRect(Math.round(cx - r / 2 + rnd(seed, i, 64) * r), Math.round(cy - 1 + rnd(seed, i, 65) * (r - 2)), 1, 1);
    }
  } else if (rnd(seed, 4, 66) < 0.15) {
    flower(c, Math.round(cx - 2 + rnd(seed, 5, 67) * 4), Math.round(cy - r / 2), hash(seed, 1, 68), false);
  }
}

function cattails(c: CanvasRenderingContext2D, px: number, py: number, seed: number, frame: number) {
  const blades = 5 + (hash(seed, 0, 70) % 3);
  for (let i = 0; i < blades; i++) {
    const bx = px + 2 + Math.round(rnd(seed, i, 71) * 11);
    const h = 8 + Math.round(rnd(seed, i, 72) * 7);
    const lean = rnd(seed, i, 73) < 0.5 ? -1 : 1;
    const sway = frame && i % 2 === 0 ? lean : 0;
    for (let k = 0; k < h; k++) {
      const x = bx + (k > h * 0.6 ? lean : 0) + (k > h * 0.8 ? sway : 0);
      const y = py + 15 - k;
      c.fillStyle = B.buschKontur;
      c.fillRect(x + 1, y, 1, 1);
      c.fillStyle = k > h - 3 ? B.halmHell : i % 2 ? B.halm : B.buschHell;
      c.fillRect(x, y, 1, 1);
    }
  }
  const heads = 1 + (hash(seed, 1, 74) % 2);
  for (let i = 0; i < heads; i++) {
    const hx = px + 3 + Math.round(rnd(seed, i, 75) * 9) + (frame && i === 0 ? 1 : 0);
    const hy = py + 1 + Math.round(rnd(seed, i, 76) * 3);
    c.fillStyle = B.halm;
    c.fillRect(hx + 1, hy + 6, 1, 15 - (hy - py) - 6);
    c.fillStyle = B.holzKontur;
    c.fillRect(hx, hy, 3, 7);
    c.fillStyle = B.kolben;
    c.fillRect(hx + 1, hy + 1, 1, 5);
    c.fillStyle = B.kolbenHell;
    c.fillRect(hx + 1, hy + 1, 1, 2);
    c.fillStyle = B.halmHell;
    c.fillRect(hx + 1, hy - 2, 1, 2);
  }
}

function post(c: CanvasRenderingContext2D, x: number, y: number) {
  // Runder Holzpfosten: Kopf hell mit Jahresring, Körper mit Kontur
  c.fillStyle = B.holzKontur;
  c.fillRect(x, y + 1, 5, 7);
  c.fillRect(x + 1, y, 3, 1);
  c.fillStyle = B.holzMitte;
  c.fillRect(x + 1, y + 2, 3, 5);
  c.fillStyle = B.holzDunkel;
  c.fillRect(x + 3, y + 3, 1, 4);
  c.fillStyle = B.holzHell;
  c.fillRect(x + 1, y + 1, 3, 1);
  c.fillStyle = '#fbc67e';
  c.fillRect(x + 2, y + 1, 1, 1);
}


/** So viele Kacheln malt der Boden über jeden Kartenrand hinaus. */
export const TERRAIN_MARGIN = 8;

/** Zeichnet den ganzen Boden einer Map. frame 0/1 = leichte Wasser- und Schilfbewegung. */
export function paintTerrain(src: Grid, frame: number): HTMLCanvasElement {
  // Rand: die Landschaft läuft über den Kartenrand hinaus weiter (Randkacheln fortgesetzt), damit unter der
  // Anzeige oben und den Leisten unten keine einfarbige Fläche erscheint. Das Bild liegt bei -RAND·16.
  const M = TERRAIN_MARGIN;
  const grid: Grid = {
    id: src.id,
    w: src.w + 2 * M,
    h: src.h + 2 * M,
    cells: Array.from({ length: (src.w + 2 * M) * (src.h + 2 * M) }, (_, i) => {
      const x = Math.min(src.w - 1, Math.max(0, (i % (src.w + 2 * M)) - M));
      const y = Math.min(src.h - 1, Math.max(0, Math.floor(i / (src.w + 2 * M)) - M));
      return src.cells[y * src.w + x]!;
    }),
  };
  const PW = grid.w * T;
  const PH = grid.h * T;
  const canvas = document.createElement('canvas');
  canvas.width = PW;
  canvas.height = PH;
  const c = canvas.getContext('2d')!;
  const cell = (x: number, y: number) =>
    grid.cells[Math.min(grid.h - 1, Math.max(0, y)) * grid.w + Math.min(grid.w - 1, Math.max(0, x))]!;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < grid.w && y < grid.h;
  const at = (x: number, y: number) => (inside(x, y) ? cell(x, y) : null);

  // 1) Material je Pixel, Grenzen leicht verwackelt (weiche, natürliche Ränder)
  const mat = new Uint8Array(PW * PH);
  for (let py = 0; py < PH; py++)
    for (let px = 0; px < PW; px++) {
      const own = MAT[cell(px >> 4, py >> 4)] ?? G;
      let m = own;
      if (own !== F && own !== X) {
        const jx = px + (noise(px, py, 6, 1) - 0.5) * 8;
        const jy = py + (noise(px, py, 6, 2) - 0.5) * 8;
        const other = MAT[cell(Math.floor(jx / T), Math.floor(jy / T))] ?? G;
        if (other !== F && other !== X) m = other;
      }
      mat[py * PW + px] = m;
    }

  // 2) Abstand jedes Wasserpixels zum Land (für Uferband und Tiefe), höchstens 9
  const dist = new Uint8Array(PW * PH).fill(255);
  const queue: number[] = [];
  for (let i = 0; i < mat.length; i++) if (mat[i] !== W) { dist[i] = 0; queue.push(i); }
  for (let qi = 0; qi < queue.length; qi++) {
    const i = queue[qi]!;
    const d = dist[i]!;
    if (d >= 9) continue;
    const x = i % PW, y = (i / PW) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= PW || ny >= PH) continue;
      const j = ny * PW + nx;
      if (dist[j]! > d + 1) { dist[j] = d + 1; queue.push(j); }
    }
  }

  // 3) Grundfarben pixelweise
  const img = c.createImageData(PW, PH);
  const put = (i: number, hex: string) => {
    const [r, g, b] = rgb(hex);
    img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
  };
  const m = (x: number, y: number) => (x < 0 || y < 0 || x >= PW || y >= PH ? -1 : mat[y * PW + x]!);
  for (let py = 0; py < PH; py++)
    for (let px = 0; px < PW; px++) {
      const i = py * PW + px;
      const k = mat[i]!;
      const tx = px >> 4, ty = py >> 4;
      if (k === W) {
        const d = dist[i]!;
        const landAbove = m(px, py - 1) !== W && m(px, py - 1) !== -1 || (m(px, py - 2) !== W && m(px, py - 2) !== -1);
        if (landAbove) put(i, B.uferSchatten);
        else if (d <= 1) put(i, (px + py + frame) % 4 === 0 ? B.wasserUfer : B.schaum);
        else if (d <= 4) put(i, B.wasserUfer);
        else {
          const n = noise(px, py, 44, 5);
          put(i, n < 0.3 ? B.wasserTief : n > 0.78 ? B.wasserHell : B.wasser);
        }
      } else if (k === G) {
        const n = noise(px, py, 40, 3);
        let col: string = n > 0.76 ? B.grasHell : n < 0.22 ? B.grasDunkel : B.gras;
        const s = rnd(px, py, 9);
        if (s < 0.012) col = B.grasDunkel;
        else if (s > 0.992) col = B.grasHell;
        if (m(px, py + 1) === W || m(px + 1, py) === W || m(px - 1, py) === W) col = B.halmDunkel;
        else if (m(px, py + 2) === W) col = B.halm;
        put(i, col);
      } else if (k === S) {
        const s = rnd(px, py, 13);
        let col: string = s < 0.022 ? B.sandDunkel : s > 0.985 ? B.sandHell : B.sand;
        const near = [m(px, py + 1), m(px, py - 1), m(px + 1, py), m(px - 1, py), m(px, py + 2), m(px + 2, py), m(px - 2, py)];
        if (near.includes(W)) col = B.sandNass;
        else if (near.includes(G)) col = B.sandDunkel;
        put(i, col);
      } else if (k === P) {
        const s = rnd(px, py, 17);
        let col: string = noise(px, py, 14, 18) > 0.62 ? B.pfadHell : B.pfad;
        if (s < 0.06) col = B.pfadDunkel;
        const near = [m(px, py + 1), m(px, py - 1), m(px + 1, py), m(px - 1, py)];
        if (near.includes(G)) col = B.pfadDunkel;
        if (near.includes(W)) col = B.sandNass;
        put(i, col);
      } else if (k === F) {
        // Lange Dielen von links nach rechts: jede Reihe mit eigener Brettlänge, wenige Stöße, feine Maserung
        const row = Math.floor(py / 6);
        const ry = py % 6;
        const len = 56 + (hash(row, 1, 30) % 40);
        const shift = hash(row, 2, 30) % len;
        const plank = Math.floor((px + shift) / len);
        const plankX = (px + shift) % len;
        const tone = hash(row, plank, 32) % 3;
        let col: string = tone === 0 ? B.dieleDunkel : B.diele;
        if (ry === 0) col = B.dieleHell;
        if (ry === 5) col = B.dieleFuge;
        else if (plankX === 0) col = B.dieleFuge;
        else if (ry === 2 + (hash(row, plank, 33) % 2) && (plankX + (hash(row, plank, 34) % 9)) % 13 < 4) col = B.dieleDunkel;
        put(i, col);
      } else {
        // Wand: Mauerkrone dunkel, die Raumseite heller Lehm mit Holzleiste
        const below = at(tx, ty + 1);
        if (below && below !== 'wand') {
          const ly = py % T;
          let col: string = rnd(px, py, 33) < 0.08 ? B.lehmDunkel : rnd(px, py, 34) < 0.05 ? B.lehmHell : B.lehm;
          if (ly >= 13) col = ly === 13 ? B.holzKontur : B.holzMitte;
          put(i, col);
        } else {
          put(i, (py % T) === 15 || (at(tx, ty - 1) !== 'wand' && py % T === 0) ? B.wandKroneHell : B.wandKrone);
        }
      }
    }
  c.putImageData(img, 0, 0);

  // 4) Wasser: Wellenstriche und versunkene Steine
  for (let ty = 0; ty < grid.h; ty++)
    for (let tx = 0; tx < grid.w; tx++) {
      if (cell(tx, ty) !== 'water') continue;
      const px = tx * T, py = ty * T;
      for (let k = 0; k < 2; k++) {
        if (rnd(tx, ty, 40 + k) > 0.55) continue;
        const len = 3 + (hash(tx, ty, 42 + k) % 3);
        const x = px + 1 + (hash(tx, ty, 44 + k) % (14 - len)) + (frame ? 1 : 0);
        const y = py + 2 + (hash(tx, ty, 46 + k) % 12);
        if (dist[y * PW + Math.min(PW - 1, x)]! < 4 || dist[y * PW + Math.min(PW - 1, x + len)]! < 4) continue;
        c.fillStyle = B.welle;
        c.fillRect(x, y, len, 1);
        c.fillStyle = B.welleHell;
        c.fillRect(x + 1, y, Math.max(1, len - 3), 1);
      }
      const open = [-1, 0, 1].every((dy) => [-1, 0, 1].every((dx) => at(tx + dx, ty + dy) === 'water' || at(tx + dx, ty + dy) === null));
      if (open && rnd(tx, ty, 48) < 0.1) {
        const cx = px + 5 + (hash(tx, ty, 49) % 6), cy = py + 5 + (hash(tx, ty, 50) % 6);
        ellipse(c, cx, cy, 4, 2, B.uferSchatten);
        ellipse(c, cx - 1, cy - 1, 2, 1, B.wasserTief);
      }
    }

  // 5) Ufersteine, Pfadsteinchen, Grasbüschel, Blumen (gesammelt und nach Höhe sortiert gemalt)
  const draws: { y: number; fn: () => void }[] = [];
  const isWater = (t: string | null) => t === 'water';
  for (let ty = 0; ty < grid.h; ty++)
    for (let tx = 0; tx < grid.w; tx++) {
      const t = cell(tx, ty);
      const px = tx * T, py = ty * T;
      const land = t === 'grass' || t === 'blumen' || t === 'sand' || t === 'pfad';
      if (land) {
        const sides: [number, number][] = [];
        if (isWater(at(tx, ty + 1))) sides.push([0, 1]);
        if (isWater(at(tx, ty - 1))) sides.push([0, -1]);
        if (isWater(at(tx - 1, ty))) sides.push([-1, 0]);
        if (isWater(at(tx + 1, ty))) sides.push([1, 0]);
        for (const [dx, dy] of sides) {
          const count = t === 'sand' ? (rnd(tx, ty, 51 + dx + dy * 3) < 0.4 ? 1 : 0) : 2;
          for (let k = 0; k < count; k++) {
            const along = 4 + k * 8 + Math.round((rnd(tx, ty, 52 + k) - 0.5) * 3);
            const rx = 3 + (hash(tx, ty, 53 + k) % 3);
            const ry = 2 + (hash(tx, ty, 54 + k) % 2);
            const cx = dy !== 0 ? px + along : dx < 0 ? px + 1 : px + 14;
            const cy = dy !== 0 ? (dy > 0 ? py + 14 : py + 2) : py + along;
            draws.push({ y: cy, fn: () => stone(c, cx, cy, rx, ry) });
          }
        }
      }
      if (t === 'pfad' && rnd(tx, ty, 55) < 0.35) {
        const x = px + 3 + (hash(tx, ty, 56) % 10), y = py + 3 + (hash(tx, ty, 57) % 10);
        c.fillStyle = B.pfadStein;
        c.fillRect(x, y + 1, 3, 1);
        c.fillStyle = B.pfadHell;
        c.fillRect(x, y, 2, 1);
      }
      if (t === 'grass' || t === 'blumen') {
        const near = (dx: number, dy: number) => at(tx + dx, ty + dy) === 'grass' || at(tx + dx, ty + dy) === 'blumen' || at(tx + dx, ty + dy) === 'blocked' || at(tx + dx, ty + dy) === null;
        const inner = near(0, 1) && near(0, -1) && near(1, 0) && near(-1, 0);
        const tufts = rnd(tx, ty, 58) < (inner ? 0.42 : 0.25) ? 1 : 0;
        for (let k = 0; k < tufts; k++) {
          const tuft = TUFTS[hash(tx, ty, 59 + k) % TUFTS.length]!;
          const x = px + 1 + (hash(tx, ty, 60 + k) % 9), y = py + 2 + (hash(tx, ty, 62 + k) % 10);
          draws.push({ y: y + 3, fn: () => stamp(c, x, y, tuft, hash(tx, ty, 64 + k) % 2 === 0) });
        }
        const flowers = t === 'blumen' ? 2 + (hash(tx, ty, 65) % 2) : inner && rnd(tx, ty, 66) < 0.08 ? 1 : 0;
        if (t === 'blumen') draws.push({ y: py + 9, fn: () => ellipse(c, px + 8, py + 10, 5, 2, B.halm) });
        for (let k = 0; k < flowers; k++) {
          const x = px + 3 + (hash(tx, ty, 67 + k) % 10), y = py + 3 + (hash(tx, ty, 69 + k) % 8);
          const kind = t === 'blumen' ? hash(tx, ty, 71) + k : hash(tx, ty, 72);
          draws.push({ y: y + 4, fn: () => flower(c, x, y, kind) });
        }
      }
    }
  draws.sort((a, b) => a.y - b.y).forEach((d) => d.fn());

  // 6) Steg, Zaun, Schilf, Büsche (überlappen ihre Kachel, darum zuletzt und von oben nach unten)
  for (let ty = 0; ty < grid.h; ty++)
    for (let tx = 0; tx < grid.w; tx++) {
      const t = cell(tx, ty);
      const px = tx * T, py = ty * T;
      if (t === 'steg') {
        const across = at(tx - 1, ty) === 'steg' || at(tx + 1, ty) === 'steg';
        if (across) {
          c.fillStyle = B.uferSchatten;
          c.fillRect(px, py + 14, T, 2);
          for (let bx = 0; bx < T; bx += 4) {
            const x = px + bx;
            c.fillStyle = B.holzKontur;
            c.fillRect(x, py + 1 - (hash(tx, bx, 80) % 2), 4, 14);
            c.fillStyle = (bx / 4) % 2 ? B.holz : B.holzMitte;
            c.fillRect(x, py + 2, 3, 11);
            c.fillStyle = B.holzHell;
            c.fillRect(x, py + 2, 1, 11);
            c.fillStyle = B.holzDunkel;
            c.fillRect(x + 2, py + 3, 1, 10);
          }
        } else {
          const tip = at(tx, ty - 1) !== 'steg';
          c.fillStyle = B.uferSchatten;
          c.fillRect(px + 15, py + 1, 1, T);
          c.fillStyle = B.holzKontur;
          c.fillRect(px + 1, py, 14, T);
          for (let by = 0; by < T; by += 4) {
            const y = py + by;
            const l = hash(tx, ty * 4 + by, 81) % 2;
            c.fillStyle = B.holzKontur;
            c.fillRect(px + 1 - l, y, 14 + l, 4);
            c.fillStyle = (by / 4) % 2 ? B.holz : B.holzMitte;
            c.fillRect(px + 2 - l, y + 1, 12 + l, 2);
            c.fillStyle = B.holzHell;
            c.fillRect(px + 2 - l, y + 1, 12 + l, 1);
            c.fillStyle = B.holzDunkel;
            c.fillRect(px + 2 - l, y + 3, 12 + l, 1);
          }
          if (tip) {
            c.fillStyle = B.uferSchatten;
            c.fillRect(px + 1, py - 1, 14, 1);
            post(c, px - 1, py - 3);
            post(c, px + 12, py - 3);
          } else if (ty % 3 === 0) {
            post(c, px - 1, py + 4);
            post(c, px + 12, py + 4);
          }
        }
      } else if (t === 'zaun') {
        const z = (dx: number, dy: number) => at(tx + dx, ty + dy) === 'zaun';
        const horiz = z(-1, 0) || z(1, 0) || !(z(0, -1) || z(0, 1));
        if (horiz) {
          for (const ry of [5, 10]) {
            c.fillStyle = B.holzKontur;
            c.fillRect(px, py + ry - 1, T, 4);
            c.fillStyle = B.holz;
            c.fillRect(px, py + ry, T, 2);
            c.fillStyle = B.holzHell;
            c.fillRect(px, py + ry, T, 1);
          }
        }
        if (z(0, -1) || z(0, 1)) {
          c.fillStyle = B.holzKontur;
          c.fillRect(px + 6, py, 4, T);
          c.fillStyle = B.holz;
          c.fillRect(px + 7, py, 2, T);
          c.fillStyle = B.holzHell;
          c.fillRect(px + 7, py, 1, T);
        }
        post(c, px + 5, py + 2);
      } else if (t === 'schilf') {
        cattails(c, px, py, hash(tx, ty, 82), frame);
      }
    }
  for (let ty = 0; ty < grid.h; ty++)
    for (let tx = 0; tx < grid.w; tx++) {
      if (cell(tx, ty) !== 'blocked') continue;
      const seed = hash(tx, ty, 90);
      const r = 8 + (seed % 3);
      bush(c, tx * T + 8 + ((seed >> 3) % 3) - 1, ty * T + 8 + ((seed >> 5) % 3) - 1, r, seed);
    }
  return canvas;
}

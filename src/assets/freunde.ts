// Freunde ohne eigenen Codex-Entwurf, im Stil der Codex-Figuren gezeichnet (Paket 01, Stilreferenz Starter-Otter):
// eine gemeinsame dunkle warme Kontur um die ganze Figur, weiche Schattenseite unten rechts, Glanz oben links,
// kleine schwarze Augen mit Lichtpunkt, rosa Bäckchen. Blick nach rechts (se); ne zeigt den Rücken.
// Frame 48 × 48, Bodenanker (24, 40). Bei Wasserfiguren ist y = 40 die Wasserlinie.
type C = CanvasRenderingContext2D;

export const KONTUR = '#4a2e20';
const AUGE = '#24140f';
const GLANZ = '#ffffff';
const BACKE = '#f3a3a3';
const WASSER = 'rgba(38, 150, 141, 0.62)';
const RING = '#a9e3d2';
const SCHATTEN = 'rgba(40, 30, 20, 0.22)';

export function ell(c: C, cx: number, cy: number, rx: number, ry: number, col: string) {
  if (rx <= 0 || ry <= 0) return;
  c.fillStyle = col;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) c.fillRect(x, y, 1, 1);
    }
}
export const px = (c: C, x: number, y: number, col: string, w = 1, h = 1) => {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), w, h);
};

export interface Part {
  x: number;
  y: number;
  rx: number;
  ry: number;
  col: string;
  shade?: string;
  hi?: string;
  /** eigene Kontur auch innerhalb der Figur (z. B. Kopf vor dem Körper) */
  line?: boolean;
}

/** Zeichnet Teile mit gemeinsamer Außenkontur, Schatten und Glanz. */
export function figure(c: C, parts: Part[]) {
  for (const p of parts) ell(c, p.x, p.y, p.rx + 1, p.ry + 1, KONTUR);
  for (const p of parts) {
    if (p.line) ell(c, p.x, p.y, p.rx + 1, p.ry + 1, KONTUR);
    ell(c, p.x, p.y, p.rx, p.ry, p.shade ?? p.col);
    if (p.shade) ell(c, p.x - 0.8, p.y - 0.9, p.rx - 0.7, p.ry - 0.8, p.col);
    if (p.hi) ell(c, p.x - p.rx * 0.38, p.y - p.ry * 0.42, Math.max(1, p.rx * 0.32), Math.max(0.8, p.ry * 0.26), p.hi);
  }
}

function eye(c: C, x: number, y: number, tall = 3) {
  px(c, x, y, AUGE, 2, tall);
  px(c, x, y, GLANZ);
}

function shadow(c: C, w: number) {
  ell(c, 24, 41, w, 1.6, SCHATTEN);
}

/** Alles unterhalb der Wasserlinie wird wasserfarben überzogen, an der Linie ein heller Ring. */
function underWater(c: C, f: number, rx: number) {
  c.save();
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = WASSER;
  c.fillRect(0, 41, 48, 7);
  c.restore();
  const wob = f % 2;
  px(c, 24 - rx - wob, 41, RING, 3, 1);
  px(c, 24 + rx - 2 + wob, 41, RING, 3, 1);
  px(c, 24 - rx + 3, 42, RING, 2, 1);
  px(c, 24 + rx - 4, 42, RING, 2, 1);
}

// ---------------- Meerkat (Erdmännchen) ----------------

const MK = { fell: '#d9a86a', schatten: '#b8844f', glanz: '#efc68e', bauch: '#f4dcae', dunkel: '#6e4a32' };

export function paintMeerkat(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  if (state === 'walk') {
    const dy = f % 2 === 0 ? 0 : -1;
    shadow(c, 12);
    const lift = (i: number) => ((f + i) % 4 === 1 ? 1 : 0);
    figure(c, [
      { x: 11, y: 33 + dy, rx: 4.5, ry: 1.6, col: MK.fell, shade: MK.schatten },
      { x: 17, y: 38 - lift(0), rx: 1.6, ry: 2.2, col: MK.schatten },
      { x: 29, y: 38 - lift(2), rx: 1.6, ry: 2.2, col: MK.schatten },
      { x: 23, y: 33 + dy, rx: 9.5, ry: 4.6, col: MK.fell, shade: MK.schatten, hi: MK.glanz },
      { x: 20, y: 38 - lift(1), rx: 1.6, ry: 2.2, col: MK.fell, shade: MK.schatten },
      { x: 32, y: 38 - lift(3), rx: 1.6, ry: 2.2, col: MK.fell, shade: MK.schatten },
      { x: 33, y: 28 + dy, rx: 4.8, ry: 4.2, col: MK.fell, shade: MK.schatten, hi: MK.glanz, line: true },
      { x: 37.5, y: 30 + dy, rx: 2.6, ry: 1.8, col: MK.bauch, shade: MK.fell },
    ]);
    ell(c, 30.5, 24.5 + dy, 1.4, 1.2, MK.dunkel);
    ell(c, 24, 35.5 + dy, 6, 1.4, MK.bauch);
    if (!back) {
      ell(c, 34.5, 27.5 + dy, 1.8, 1.8, MK.dunkel);
      eye(c, 34, 26 + dy, 2);
      px(c, 39.5, 29 + dy, AUGE, 1, 1);
    }
    return;
  }
  const dy = f % 2;
  shadow(c, 8);
  figure(c, [
    { x: 17.5, y: 36, rx: 2.2, ry: 4.4, col: MK.fell, shade: MK.schatten },
    { x: 21, y: 39.4, rx: 2.6, ry: 1.3, col: MK.schatten },
    { x: 24, y: 30 + dy, rx: 6, ry: 9.4, col: MK.fell, shade: MK.schatten, hi: MK.glanz },
    { x: 27.5, y: 39.4, rx: 2.6, ry: 1.3, col: MK.fell, shade: MK.schatten },
    { x: 25, y: 16.5 + dy, rx: 5.6, ry: 5, col: MK.fell, shade: MK.schatten, hi: MK.glanz, line: true },
    { x: 30, y: 18.5 + dy, rx: 3, ry: 2.2, col: MK.bauch, shade: MK.fell },
  ]);
  if (!back) {
    ell(c, 25.5, 31.5 + dy, 3.6, 7, MK.bauch);
    figure(c, [{ x: 27.5, y: 25.5 + dy, rx: 1.5, ry: 2.4, col: MK.fell, shade: MK.schatten }]);
  }
  ell(c, 20.5, 13 + dy, 1.5, 1.4, MK.dunkel);
  if (!back) {
    ell(c, 26.5, 16 + dy, 2.2, 2.2, MK.dunkel);
    eye(c, 26, 15 + dy, 2);
    px(c, 32.5, 17.5 + dy, AUGE, 1, 2);
    px(c, 29, 20 + dy, BACKE, 2, 1);
  }
}

// ---------------- Axolotl (Rosie rosa, Bubbles blau) ----------------

const AXO: Record<string, { haut: string; schatten: string; glanz: string; kiemen: string; spitze: string; mund: string }> = {
  rosa: { haut: '#f7b6c8', schatten: '#e08da7', glanz: '#ffdbe6', kiemen: '#e5647f', spitze: '#b9405d', mund: '#9a3b55' },
  blau: { haut: '#a2d2ef', schatten: '#71a9d6', glanz: '#d6efff', kiemen: '#5f92d8', spitze: '#3d68b0', mund: '#2f4f86' },
};

export function paintAxolotl(c: C, f: number, dir: string, farbe: string) {
  const k = AXO[farbe] ?? AXO.rosa!;
  const back = dir === 'ne';
  const dy = f % 2;
  const tail = f % 4 === 1 ? 1 : f % 4 === 3 ? -1 : 0;
  figure(c, [
    { x: 10, y: 41 + tail, rx: 5, ry: 2.4, col: k.haut, shade: k.schatten },
    { x: 19, y: 41, rx: 8.5, ry: 3.8, col: k.haut, shade: k.schatten, hi: k.glanz },
    // Kiemenbüschel hinten am Kopf, je drei Wedel
    { x: 24, y: 31 + dy, rx: 2.4, ry: 1.3, col: k.kiemen, shade: k.spitze },
    { x: 23, y: 34.5 + dy, rx: 2.6, ry: 1.3, col: k.kiemen, shade: k.spitze },
    { x: 24, y: 38 + dy, rx: 2.4, ry: 1.3, col: k.kiemen, shade: k.spitze },
    { x: 30, y: 35.5 + dy, rx: 7.2, ry: 5.6, col: k.haut, shade: k.schatten, hi: k.glanz, line: true },
    { x: 34.5, y: 30 + dy, rx: 1.8, ry: 1.2, col: k.kiemen, shade: k.spitze },
  ]);
  if (!back) {
    eye(c, 28, 34 + dy, 2);
    eye(c, 33, 34 + dy, 2);
    px(c, 30, 38 + dy, k.mund);
    px(c, 31, 39 + dy, k.mund, 2, 1);
    px(c, 33, 38 + dy, k.mund);
    px(c, 26, 37 + dy, BACKE, 2, 1);
    px(c, 35, 37 + dy, BACKE, 2, 1);
  }
  underWater(c, f, 10);
}

// ---------------- Chamaron (Chamäleon; hell und neutral, das Spiel tönt ihn) ----------------

const CH = { haut: '#ece8dc', schatten: '#c9c2ae', glanz: '#fbf9f2', dunkel: '#9d957f' };

export function paintChamaron(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const walk = state === 'walk';
  const dy = walk ? (f % 2 === 0 ? 0 : -1) : 0;
  const lift = (i: number) => (walk && (f + i) % 4 === 1 ? 1 : 0);
  shadow(c, 12);
  figure(c, [
    { x: 12.5, y: 33 + dy, rx: 4.2, ry: 3.8, col: CH.haut, shade: CH.schatten },
    { x: 19, y: 38 - lift(0), rx: 1.5, ry: 2.4, col: CH.schatten },
    { x: 29, y: 38 - lift(2), rx: 1.5, ry: 2.4, col: CH.schatten },
    { x: 18.5, y: 26 + dy, rx: 1.6, ry: 1.6, col: CH.haut, shade: CH.schatten },
    { x: 22.5, y: 25 + dy, rx: 1.6, ry: 1.6, col: CH.haut, shade: CH.schatten },
    { x: 26.5, y: 25.5 + dy, rx: 1.6, ry: 1.6, col: CH.haut, shade: CH.schatten },
    { x: 23.5, y: 31.5 + dy, rx: 9, ry: 5.8, col: CH.haut, shade: CH.schatten, hi: CH.glanz },
    { x: 22, y: 38 - lift(1), rx: 1.5, ry: 2.4, col: CH.haut, shade: CH.schatten },
    { x: 31.5, y: 38 - lift(3), rx: 1.5, ry: 2.4, col: CH.haut, shade: CH.schatten },
    { x: 33.5, y: 29.5 + dy, rx: 5.4, ry: 4.4, col: CH.haut, shade: CH.schatten, hi: CH.glanz, line: true },
    { x: 38, y: 31 + dy, rx: 2.4, ry: 1.8, col: CH.haut, shade: CH.schatten },
  ]);
  // eingerollter Schwanz
  ell(c, 12.8, 33.2 + dy, 1.8, 1.6, CH.dunkel);
  ell(c, 13.3, 32.8 + dy, 0.9, 0.8, CH.haut);
  // Streifen auf dem Rücken
  for (const x of [19, 23, 27]) px(c, x, 29 + dy, CH.dunkel, 1, 3);
  if (!back) {
    // Drehauge: großer Hügel, Pupille wandert beim Ausruhen
    figure(c, [{ x: 34, y: 28 + dy, rx: 2.8, ry: 2.8, col: CH.glanz, shade: CH.schatten, line: true }]);
    const look = !walk && f % 2 === 1 ? -1 : 0;
    eye(c, 34 + look, 27 + dy, 2);
    px(c, 36, 32 + dy, CH.dunkel, 3, 1);
    px(c, 32, 31 + dy, BACKE, 2, 1);
  }
}

// ---------------- Erbsenschale (Beano links, Beani Mitte, Beanz rechts) ----------------

const ERB = { schote: '#7fb24a', schoteSchatten: '#5c8f35', schoteGlanz: '#a9d06a', innen: '#3f6a2a', erbse: '#9ed35a', erbseSchatten: '#72aa3e', erbseGlanz: '#d2f09a' };

export function paintErbsenschale(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const walk = state === 'walk';
  const hop = walk ? [0, -2, 0, -1][f % 4]! : 0;
  const wob = (i: number) => (walk ? ((f + i) % 2 === 0 ? 0 : -1) : f % 2 === 1 && i === 1 ? 1 : 0);
  shadow(c, walk && hop < 0 ? 12 : 15);
  // drei Erbsen sitzen in der Schote (hinter dem vorderen Rand)
  const peas: [number, number][] = [[15, 30], [24, 29], [33, 30]];
  figure(c, [
    { x: 8.5, y: 33 + hop, rx: 3, ry: 2.2, col: ERB.schote, shade: ERB.schoteSchatten },
    { x: 39.5, y: 33 + hop, rx: 3, ry: 2.2, col: ERB.schote, shade: ERB.schoteSchatten },
    { x: 24, y: 33 + hop, rx: 12.5, ry: 3.6, col: ERB.innen },
  ]);
  peas.forEach(([x, y], i) =>
    figure(c, [{ x, y: y + hop + wob(i), rx: 4.4, ry: 4.4, col: ERB.erbse, shade: ERB.erbseSchatten, hi: ERB.erbseGlanz, line: true }]),
  );
  figure(c, [{ x: 24, y: 36.5 + hop, rx: 15, ry: 4.2, col: ERB.schote, shade: ERB.schoteSchatten, hi: ERB.schoteGlanz, line: true }]);
  px(c, 12, 35 + hop, ERB.schoteGlanz, 6, 1);
  if (back) return;
  // Gesichter: Beano fröhlich (lachende Augen), Beani verträumt (halb geschlossen), Beanz neugierig (große Augen)
  const [b1, b2, b3] = peas.map(([x, y], i) => ({ x, y: y + hop + wob(i) }));
  px(c, b1!.x - 2, b1!.y - 1, AUGE, 1, 1);
  px(c, b1!.x - 3, b1!.y, AUGE, 1, 1);
  px(c, b1!.x - 1, b1!.y, AUGE, 1, 1);
  px(c, b1!.x + 1, b1!.y - 1, AUGE, 1, 1);
  px(c, b1!.x, b1!.y, AUGE, 1, 1);
  px(c, b1!.x + 2, b1!.y, AUGE, 1, 1);
  px(c, b1!.x - 1, b1!.y + 2, '#3d5a22', 3, 1);
  px(c, b1!.x, b1!.y + 3, '#c9566a', 1, 1);
  px(c, b2!.x - 3, b2!.y, AUGE, 2, 1);
  px(c, b2!.x + 1, b2!.y, AUGE, 2, 1);
  px(c, b2!.x - 1, b2!.y + 2, '#3d5a22', 2, 1);
  px(c, b2!.x - 4, b2!.y + 1, BACKE, 1, 1);
  px(c, b2!.x + 3, b2!.y + 1, BACKE, 1, 1);
  eye(c, b3!.x - 2, b3!.y - 2, 3);
  eye(c, b3!.x + 1, b3!.y - 2, 3);
  px(c, b3!.x, b3!.y + 2, '#3d5a22', 1, 1);
}

// ---------------- Bean (Rentier) ----------------

const RE = { fell: '#a8764c', schatten: '#845837', glanz: '#c99a6a', hell: '#ecd2a8', geweih: '#e6cb9c', geweihDunkel: '#b8956a', huf: '#4e3426' };

function antler(c: C, x: number, y: number, s: number) {
  // Stange mit zwei Enden, mit Kontur
  const pts: [number, number][] = [[0, 0], [0, -1], [-1, -2], [-1, -3], [-2, -4], [-2, -5], [0, -3], [1, -4], [2, -5], [-3, -5], [-3, -6]];
  for (const [dx, dy] of pts) ell(c, x + dx * s + 0.5, y + dy + 0.5, 1.4, 1.4, KONTUR);
  for (const [dx, dy] of pts) px(c, x + dx * s, y + dy, dy < -3 ? RE.geweih : RE.geweihDunkel);
}

export function paintBean(c: C, f: number, state: string, dir: string) {
  const back = dir === 'ne';
  const walk = state === 'walk';
  const dy = walk ? (f % 2 === 0 ? 0 : -1) : 0;
  const nod = !walk && f % 2 === 1 ? 1 : 0;
  const lift = (i: number) => (walk && (f + i) % 4 === 1 ? 1 : 0);
  shadow(c, 12);
  antler(c, 30, 17 + dy + nod, 1);
  antler(c, 34, 17 + dy + nod, -1);
  figure(c, [
    { x: 16.5, y: 37 - lift(0), rx: 1.4, ry: 3.6, col: RE.schatten },
    { x: 28, y: 37 - lift(2), rx: 1.4, ry: 3.6, col: RE.schatten },
    { x: 13.5, y: 27 + dy, rx: 2, ry: 1.8, col: RE.hell },
    { x: 22, y: 30.5 + dy, rx: 9, ry: 5.6, col: RE.fell, shade: RE.schatten, hi: RE.glanz },
    { x: 19, y: 37 - lift(1), rx: 1.4, ry: 3.6, col: RE.fell, shade: RE.schatten },
    { x: 30.5, y: 37 - lift(3), rx: 1.4, ry: 3.6, col: RE.fell, shade: RE.schatten },
    { x: 29.5, y: 25.5 + dy, rx: 2.8, ry: 4.4, col: RE.fell, shade: RE.schatten },
    { x: 32.5, y: 21.5 + dy + nod, rx: 4.6, ry: 4, col: RE.fell, shade: RE.schatten, hi: RE.glanz, line: true },
    { x: 36.5, y: 23.5 + dy + nod, rx: 2.6, ry: 2, col: RE.hell, shade: RE.geweih },
  ]);
  ell(c, 23, 33.5 + dy, 6, 1.6, RE.hell);
  for (const [x, i] of [[16.5, 0], [19, 1], [28, 2], [30.5, 3]] as const) px(c, x - 1, 40 - lift(i), RE.huf, 2, 1);
  figure(c, [{ x: 28.5, y: 18.5 + dy + nod, rx: 1.8, ry: 1, col: RE.fell, shade: RE.schatten }]);
  if (!back) {
    eye(c, 33, 20 + dy + nod, 2);
    px(c, 38.5, 22.5 + dy + nod, AUGE, 1, 1);
    px(c, 31, 24 + dy + nod, BACKE, 2, 1);
  }
}

// ---------------- Lumi (Otterprinzessin) ----------------
// Kommt aus dem Codex-Otter (siehe scripts/grafik/bauen.mjs); hier nur der Notbehelf, falls die Datei fehlt.
export function paintPrinzessinFallback(c: C, f: number, state: string) {
  const dy = f % 2;
  shadow(c, 10);
  figure(c, [
    { x: 14, y: 36, rx: 5, ry: 1.8, col: '#a0603c', shade: '#7c4528' },
    { x: 22, y: 33 + dy, rx: 8, ry: 5, col: '#f2a3bf', shade: '#d77a9c', hi: '#ffd0e0' },
    { x: 30, y: 25 + dy, rx: 5, ry: 4.6, col: '#a0603c', shade: '#7c4528', hi: '#c07c50', line: true },
  ]);
  px(c, 28, 19 + dy, '#e9c76a', 5, 2);
  px(c, 28, 18 + dy, '#e9c76a');
  px(c, 30, 18 + dy, '#e9c76a');
  px(c, 32, 18 + dy, '#e9c76a');
  eye(c, 31, 24 + dy, 2);
  if (state === 'swim') underWater(c, f, 9);
}

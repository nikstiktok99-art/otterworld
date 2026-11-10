// Liest die häufigsten Farben aus Bereichen eines Entwurfs (für die Boden-Palette).
import { resolve } from 'node:path';
import { DESIGN, openPixelPage } from './browser.mjs';

const areas = {
  gras: [600, 380, 200, 150],
  pfad: [180, 620, 120, 100],
  wasser: [500, 1300, 300, 200],
  wasserUfer: [700, 700, 200, 120],
  steine: [780, 610, 100, 70],
  steg: [220, 870, 400, 120],
  schilf: [850, 460, 60, 120],
  blumen: [780, 250, 150, 120],
  weide: [0, 0, 500, 200],
};
const px = await openPixelPage();
await px.load('ufer', resolve(DESIGN, 'quellen/otter-design/referenzen/stil/startufer.png'));
for (const [name, r] of Object.entries(areas)) {
  const top = await px.run(([x0, y0, w, h]) => {
    const im = window.G.img.ufer;
    const m = new Map();
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++) {
        const i = (y * im.width + x) * 4;
        const k = ((im.data[i] >> 3) << 10) | ((im.data[i + 1] >> 3) << 5) | (im.data[i + 2] >> 3);
        m.set(k, (m.get(k) ?? 0) + 1);
      }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => {
      const c = [(k >> 10) & 31, (k >> 5) & 31, k & 31].map((v) => (v * 8 + 4).toString(16).padStart(2, '0'));
      return `#${c.join('')}:${Math.round((n * 100) / (w * h))}%`;
    });
  }, r);
  console.log(name.padEnd(11), top.join('  '));
}
await px.close();

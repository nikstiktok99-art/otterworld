// Findet die einzelnen Motive in freigestellten Codex-Entwürfen (Begrenzungsrahmen in Quellpixeln).
// Aufruf: node scripts/grafik/analyse.mjs [alphaMin]
import { resolve } from 'node:path';
import { DESIGN, openPixelPage } from './browser.mjs';

const files = {
  otter: 'quellen/otter-design/referenzen/stil/starter-otter.png',
  lampe: 'quellen/otter-design/referenzen/stil/muschellampe.png',
  schnabbi: 'paket-01/entwuerfe/schnabbi-entwurf-v1.png',
  squichy: 'paket-01/entwuerfe/squichy-entwurf-v3.png',
  dinge: 'paket-03-ui-ausbau/entwuerfe/02-gegenstaende-atlas.png',
  navi: 'paket-03-ui-ausbau/entwuerfe/01-navigation-atlas.png',
  moebel: 'paket-05-bau-bausteine/quellen/moebel-v2.png',
  architektur: 'paket-05-bau-bausteine/quellen/architektur-v1.png',
};
const alphaMin = Number(process.argv[2] ?? 200);
const px = await openPixelPage();
for (const [name, rel] of Object.entries(files)) {
  await px.load(name, resolve(DESIGN, rel));
  const hist = await px.run((n) => window.G.alphaHist(n), name);
  const comps = await px.run(([n, a]) => window.G.components(n, { alphaMin: a, step: 4, minArea: 1500 }), [name, alphaMin]);
  console.log(`\n${name}  Alpha-Verteilung (je 32): ${hist.join(' ')}`);
  for (const c of comps) console.log(`  x ${c.x} y ${c.y} w ${c.w} h ${c.h}  Fläche ${c.area}`);
}
await px.close();

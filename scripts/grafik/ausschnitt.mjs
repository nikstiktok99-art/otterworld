// Speichert einen Ausschnitt eines Entwurfs mit Koordinatengitter (zum Festlegen von Umrissen).
// Aufruf: node scripts/grafik/ausschnitt.mjs <entwurf-relativ> x y w h <ziel.png> [raster]
import { resolve } from 'node:path';
import { DESIGN, openPixelPage } from './browser.mjs';

const [rel, x, y, w, h, target, step = '50'] = process.argv.slice(2);
const px = await openPixelPage();
await px.load('q', resolve(DESIGN, rel));
const url = await px.run(([x, y, w, h, step]) => {
  const im = window.G.img.q;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const tmp = document.createElement('canvas');
  tmp.width = im.width;
  tmp.height = im.height;
  tmp.getContext('2d').putImageData(im, 0, 0);
  g.drawImage(tmp, -x, -y);
  g.strokeStyle = 'rgba(255,0,255,0.5)';
  g.fillStyle = '#ff00ff';
  g.font = '12px sans-serif';
  for (let gx = Math.ceil(x / step) * step; gx < x + w; gx += step) {
    g.beginPath(); g.moveTo(gx - x + 0.5, 0); g.lineTo(gx - x + 0.5, h); g.stroke();
    g.fillText(String(gx), gx - x + 2, 12);
  }
  for (let gy = Math.ceil(y / step) * step; gy < y + h; gy += step) {
    g.beginPath(); g.moveTo(0, gy - y + 0.5); g.lineTo(w, gy - y + 0.5); g.stroke();
    g.fillText(String(gy), 2, gy - y - 2);
  }
  return c.toDataURL('image/png');
}, [Number(x), Number(y), Number(w), Number(h), Number(step)]);
px.writePng(target, url);
await px.close();

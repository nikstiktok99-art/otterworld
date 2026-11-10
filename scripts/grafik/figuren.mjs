// Kontaktblatt der Weltgrafiken direkt aus dem Spielcode (Dateien und gezeichnete Grafiken), 4-fach vergrößert.
// Aufruf: node scripts/grafik/figuren.mjs <ziel.png> [schlüssel-präfix,...]
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const target = process.argv[2];
const prefixes = (process.argv[3] ?? 'characters.').split(',');
const PORT = 5189;
const server = spawn(`npx vite --port ${PORT} --strictPort`, { shell: true, stdio: 'pipe' });
await new Promise((ok) => server.stdout.on('data', (d) => String(d).includes(String(PORT)) && ok()));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/?test`);
  const url = await page.evaluate(async (prefixes) => {
    const { sprites } = await import('/src/assets/catalog.ts');
    const { placeholderCanvas } = await import('/src/assets/placeholders.ts');
    const S = 4;
    const defs = sprites.filter((d) => prefixes.some((p) => d.key.startsWith(p)) && !d.key.endsWith('.ne'));
    const imgs = [];
    for (const d of defs) {
      if (d.file) {
        const im = new Image();
        im.src = '/' + d.file.path;
        await im.decode().catch(() => null);
        imgs.push({ d, src: im, frames: d.file.frames });
      } else imgs.push({ d, src: placeholderCanvas(d), frames: d.frames });
    }
    const W = 1600;
    let x = 8, y = 8, rowH = 0;
    const pos = [];
    for (const it of imgs) {
      const w = it.d.frameW * Math.min(it.frames, 2) * S;
      const h = it.d.frameH * S + 16;
      if (x + w > W) { x = 8; y += rowH + 8; rowH = 0; }
      pos.push([x, y]);
      x += w + 10;
      rowH = Math.max(rowH, h);
    }
    const c = document.createElement('canvas');
    c.width = W;
    c.height = y + rowH + 8;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#fff5df';
    g.fillRect(0, 0, c.width, c.height);
    imgs.forEach((it, i) => {
      const [px, py] = pos[i];
      const n = Math.min(it.frames, 2);
      g.fillStyle = it.d.key.includes('swim') || it.d.key.includes('rosie') || it.d.key.includes('bubbles') ? '#26968d' : '#94a444';
      g.fillRect(px, py, it.d.frameW * n * S, it.d.frameH * S);
      g.drawImage(it.src, 0, 0, it.d.frameW * n, it.d.frameH, px, py, it.d.frameW * n * S, it.d.frameH * S);
      g.fillStyle = '#493126';
      g.font = '12px sans-serif';
      g.fillText(it.d.key.replace('characters.', ''), px, py + it.d.frameH * S + 12);
    });
    return c.toDataURL('image/png');
  }, prefixes);
  writeFileSync(target, Buffer.from(url.split(',')[1], 'base64'));
} finally {
  await browser.close();
  server.kill();
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']).on('exit', () => process.exit(0));
  else process.exit(0);
}

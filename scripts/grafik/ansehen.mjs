// Bildschirmfotos aller Orte zum Ansehen der Grafik (Entwicklungsserver, iPhone-16-Pro-Größe).
// Aufruf: node scripts/grafik/ansehen.mjs <ausgabeordner> [map.a,map.b]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const out = resolve(process.argv[2] ?? 'grafik-ansicht');
mkdirSync(out, { recursive: true });
const maps = (process.argv[3] ?? 'map.startufer,map.schilfbucht,map.tiramisu-stream,map.zoo,map.cat-cafe,map.hotpot-restaurant,map.fuchsbau').split(',');
const PORT = 5188;
const server = spawn(`npx vite --port ${PORT} --strictPort`, { shell: true, stdio: 'pipe' });
await new Promise((ok, fail) => {
  const t = setTimeout(() => fail(new Error('Server startet nicht')), 30000);
  server.stdout.on('data', (d) => {
    if (String(d).includes(String(PORT))) {
      clearTimeout(t);
      ok();
    }
  });
});
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'de-DE' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(`http://localhost:${PORT}/?test`);
  const until = async (expr, ms = 20000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (await page.evaluate(expr).catch(() => false)) return;
      await page.waitForTimeout(100);
    }
    throw new Error(`Zeitüberschreitung: ${expr}`);
  };
  await until('window.__otterwelt && window.__otterwelt.ready()');
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, '00-titel.png') });
  await page.getByRole('button', { name: 'Spielen', exact: true }).tap();
  await page.waitForTimeout(900);
  let i = 1;
  for (const map of maps) {
    const cur = await page.evaluate('window.__otterwelt.state().location.map');
    if (cur !== map) {
      await page.evaluate(`window.__otterwelt.jump(${JSON.stringify(map)})`);
      await until(`window.__otterwelt.world() && window.__otterwelt.world().map === ${JSON.stringify(map)} && !window.__otterwelt.world().leaving`);
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: join(out, `${String(i++).padStart(2, '0')}-${map.replace('map.', '')}.png`) });
  }
  const warn = await page.evaluate('window.__otterwelt.world()?.warnings ?? null').catch(() => null);
  console.log('Fehler:', errors.length ? errors.join('\n') : 'keine', warn ? `\nTexturhinweise: ${JSON.stringify(warn)}` : '');
} finally {
  await browser.close();
  server.kill();
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']).on('exit', () => process.exit(0));
  else process.exit(0);
}

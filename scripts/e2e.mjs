// Browser-Durchlauf des ersten Abends (Chromium, iPhone-16-Pro-Größe, echte Tipp-Ereignisse).
// Zählt ausschließlich als Browserprüfung – kein Ersatz für Tests auf Android oder dem iPhone.
//
// Aufruf: npm run e2e [-- <Ausgabeordner>]
// Baut das Spiel, startet `vite preview`, spielt den Abend durch, lädt zweimal neu (nach Bauen und nach
// Aufstellen) und legt Bildschirmfotos im Ausgabeordner ab (Standard: e2e-ergebnis/).
import { spawn, execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const out = resolve(process.argv[2] ?? 'e2e-ergebnis');
mkdirSync(out, { recursive: true });
const PORT = 5179;
const URL = `http://localhost:${PORT}/?test`;

console.log('Baue …');
execSync('npx vite build', { stdio: 'inherit' });

const server = spawn(`npx vite preview --port ${PORT} --strictPort`, { shell: true, stdio: 'pipe' });
await new Promise((ok, fail) => {
  const t = setTimeout(() => fail(new Error('Vorschau-Server startet nicht')), 20000);
  server.stdout.on('data', (d) => {
    if (String(d).includes(String(PORT))) {
      clearTimeout(t);
      ok();
    }
  });
});

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 402, height: 874 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: 'de-DE',
});
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

let step = 0;
const shot = async (name) => {
  step++;
  const file = join(out, `${String(step).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: file });
  console.log(`  Foto: ${file}`);
};
const hook = (expr) => page.evaluate(`window.__otterwelt.${expr}`);
const waitFor = async (desc, expr, timeout = 15000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await page.evaluate(expr).catch(() => false)) return;
    await page.waitForTimeout(100);
  }
  throw new Error(`Zeitüberschreitung: ${desc}`);
};
const idle = () => waitFor('Figur steht', `window.__otterwelt.world() && !window.__otterwelt.world().player.moving`, 20000);
const panel = (kind) => waitFor(`Fenster ${kind}`, `window.__otterwelt.ui().panel?.kind === '${kind}'`);
const noPanel = () => waitFor('kein Fenster', `window.__otterwelt.ui().panel === null`);
// Sichtbarer Bereich ohne Anzeige oben und ohne Leisten unten.
const VIEW = { left: 24, right: 378, top: 150, bottom: 700 };
const tapTile = async (x, y) => {
  for (let i = 0; i < 4; i++) {
    const p = await hook(`tileToScreen(${x}, ${y})`);
    if (!p) throw new Error('Welt nicht bereit');
    if (p.x >= VIEW.left && p.x <= VIEW.right && p.y >= VIEW.top && p.y <= VIEW.bottom) {
      await page.touchscreen.tap(p.x, p.y);
      return;
    }
    // Ziel noch nicht zu sehen: wie eine Spielerin erst in diese Richtung laufen.
    const cx = Math.min(Math.max(p.x, VIEW.left + 40), VIEW.right - 40);
    const cy = Math.min(Math.max(p.y, VIEW.top + 60), VIEW.bottom - 60);
    await page.touchscreen.tap(cx, cy);
    await page.waitForTimeout(200);
    await idle();
  }
  throw new Error(`Kachel ${x},${y} bleibt unsichtbar`);
};
const button = (name) => page.getByRole('button', { name, exact: true });
const check = (cond, msg) => {
  if (!cond) throw new Error(`Prüfung fehlgeschlagen: ${msg}`);
  console.log(`  ok: ${msg}`);
};
const state = () => hook('state()');
const advanceDialogUntil = async (predicate) => {
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(predicate)) return;
    if ((await hook('ui()')).panel?.kind !== 'dialog') return;
    await page.locator('.backdrop.clear').tap();
    await page.waitForTimeout(120);
  }
};
const start = async () => {
  await page.goto(URL);
  await waitFor('Spiel bereit', 'window.__otterwelt && window.__otterwelt.ready()');
  await page.waitForTimeout(400);
};

try {
  console.log('1. Start');
  await start();
  await shot('titel');
  await button('Spielen').tap();
  await noPanel();
  await page.waitForTimeout(600);
  await shot('startufer');

  console.log('2. Zu Schnabbi und Namenswahl');
  await tapTile(10, 16);
  await idle();
  await tapTile(10, 8);
  await panel('dialog');
  await page.waitForTimeout(300);
  await shot('begruessung');
  await advanceDialogUntil(`!!document.querySelector('#name-input')`);
  await page.locator('#name-input').fill('Lina');
  await shot('namenswahl');
  await button('Passt so').tap();
  await page.waitForTimeout(200);
  await shot('mit-namen');
  await advanceDialogUntil('false');
  await noPanel();
  let s = await state();
  check(s.player.name === 'Lina', 'Name gespeichert');
  check(s.quests['quest.schnabbi.licht']?.step === 'sammeln', 'Quest gestartet');
  check(s.recipesKnown.includes('recipe.uferleuchte'), 'Rezept gelernt');

  console.log('3. Sammeln (inkl. Schwimmen)');
  await tapTile(4, 17);
  await idle();
  await waitFor('Treibholz 1', `window.__otterwelt.state().inventory['item.treibholz'] === 1`);
  await tapTile(4, 17); // nochmal tippen: keine zweite Belohnung
  await page.waitForTimeout(400);
  await tapTile(6, 11);
  await page.waitForTimeout(1300);
  await shot('schwimmen');
  await idle();
  await waitFor('Treibholz 2', `window.__otterwelt.state().inventory['item.treibholz'] === 2`);
  await tapTile(13, 18);
  await idle();
  await waitFor('Muschel', `window.__otterwelt.state().inventory['item.muschelschale'] === 1`);
  s = await state();
  check(s.inventory['item.treibholz'] === 2, 'genau zwei Treibholz trotz Doppeltipp');
  check(s.quests['quest.schnabbi.licht'].step === 'bauen', 'Quest wartet auf die Werkbank');
  await shot('gesammelt');

  console.log('4. Werkbank');
  await tapTile(11, 24);
  await panel('werkbank');
  await shot('werkbank');
  await button('Bauen').tap();
  await page.waitForTimeout(300);
  await shot('gebaut');
  await hook('flush()');

  console.log('5. Unterbrechen direkt nach dem Bauen (Neuladen)');
  await start();
  s = await state();
  check(s.inventory['item.uferleuchte'] === 1 && !s.inventory['item.treibholz'], 'nach Neuladen: Leuchte im Beutel, Zutaten weg');
  check(s.quests['quest.schnabbi.licht'].step === 'aufstellen', 'nach Neuladen: Quest bei „aufstellen“');
  await button('Weiterspielen').tap();
  await noPanel();

  console.log('6. Aufstellen');
  await button('Beutel').tap();
  await panel('bag');
  await shot('beutel');
  await button('Aufstellen').tap();
  await page.waitForTimeout(700);
  await tapTile(10, 16);
  await page.waitForTimeout(200);
  const blocked = await page.locator('.deco-text').textContent();
  check(blocked?.includes('Steg'), `vor dem Steg abgelehnt („${blocked}“)`);
  await shot('dekorieren-abgelehnt');
  await tapTile(6, 15);
  await page.waitForTimeout(150);
  check((await page.locator('.deco-text').textContent())?.includes('Wasser'), 'auf Wasser abgelehnt');
  await tapTile(8, 17);
  await page.waitForTimeout(200);
  await shot('dekorieren-gueltig');
  await button('Hier aufstellen').tap();
  await page.waitForTimeout(300);
  s = await state();
  check(s.deco.length === 1 && s.quests['quest.schnabbi.licht'].step === 'abend', 'Leuchte steht, Quest bei „abend“');
  await page.waitForTimeout(1500);
  await shot('schnabbi-kommt');
  await hook('flush()');

  console.log('7. Unterbrechen direkt nach dem Aufstellen (Neuladen)');
  await start();
  s = await state();
  check(s.deco.length === 1 && s.deco[0].tile.x === 8 && s.deco[0].tile.y === 17, 'nach Neuladen: Leuchte steht am gewählten Platz');
  check(s.moments.length === 0, 'nach Neuladen: Belohnung noch nicht vergeben');
  const npc = (await hook('world()')).npcs[0];
  check(npc.tile.x === 9 && npc.tile.y === 17 && npc.pose === 'sit', 'nach Neuladen: Schnabbi sitzt neben der Leuchte');
  await button('Weiterspielen').tap();
  await noPanel();
  await page.waitForTimeout(500);
  await shot('nach-neuladen');

  console.log('8. Abschluss');
  await tapTile(9, 17);
  await panel('dialog');
  await advanceDialogUntil(`document.querySelector('.dialog-text.narration') !== null`);
  await page.waitForTimeout(700);
  await shot('leuchte-geht-an');
  await advanceDialogUntil('false');
  await panel('endcard');
  await shot('abschlusskarte');
  await button('Weiterspielen').tap();
  await noPanel();
  s = await state();
  check(s.quests['quest.schnabbi.licht'].done, 'Quest abgeschlossen');
  check(s.deco[0].on, 'Leuchte brennt');
  check(JSON.stringify(s.moments) === '["moment.schnabbi.erster-abend"]', 'Moment genau einmal');
  await page.waitForTimeout(800);
  await shot('abend');

  console.log('9. Nach Abschluss erneut mit Schnabbi sprechen: keine zweite Belohnung');
  await tapTile(9, 17);
  await panel('dialog');
  await advanceDialogUntil('false');
  await noPanel();
  s = await state();
  check(s.moments.length === 1, 'weiterhin genau ein Moment');
  await hook('flush()');

  console.log('10. Neuladen am Ende');
  await start();
  s = await state();
  check(s.quests['quest.schnabbi.licht'].done && s.deco[0].on, 'Endstand bleibt nach Neuladen erhalten');
  check((await button('Weiterspielen').count()) === 1, 'Startbild bietet „Weiterspielen“');

  check(consoleErrors.length === 0, `keine Fehler in der Browserkonsole${consoleErrors.length ? ': ' + consoleErrors.join(' | ') : ''}`);
  console.log('\nBrowser-Durchlauf bestanden.');
} catch (e) {
  await shot('fehler').catch(() => {});
  console.error('\nBrowser-Durchlauf FEHLGESCHLAGEN:', e.message);
  if (consoleErrors.length) console.error('Konsole:', consoleErrors);
  process.exitCode = 1;
} finally {
  await browser.close();
  // Den ganzen Prozessbaum des Vorschau-Servers beenden (unter Windows hängt er sonst weiter).
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
    } catch {}
  } else {
    server.kill();
  }
}

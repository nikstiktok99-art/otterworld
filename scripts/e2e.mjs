// Browser-Durchlauf von Phase 1 und 2 (Chromium, iPhone-16-Pro-Größe, echte Tipp-Ereignisse).
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
const VIEW = { left: 24, right: 378, top: 150, bottom: 790 };
const tapTile = async (x, y) => {
  for (let i = 0; i < 8; i++) {
    const p = await hook(`tileToScreen(${x}, ${y})`);
    if (!p) throw new Error('Welt nicht bereit');
    // Im Dekoriermodus liegt unten die Leiste – dort nicht in die Welt tippen.
    const bottom = (await hook('ui()')).decorate ? 700 : VIEW.bottom;
    if (p.x >= VIEW.left && p.x <= VIEW.right && p.y >= VIEW.top && p.y <= bottom) {
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
  check((await page.locator('.hint').textContent())?.includes('Schnabbi wartet am Ende des Stegs'), 'Hinweis zum Einstieg');
  check((await hook('world()')).npcs[0]?.news === true, 'Sprechblase über Schnabbi');

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

  // ---------------- Phase 2: Ein Platz für zwei ----------------
  const Q2 = 'quest.schnabbi.schilf';
  const inMap = (id) => waitFor(`Map ${id}`, `window.__otterwelt.world()?.map === '${id}' && !window.__otterwelt.world().leaving`, 20000);
  const npcBodies = async () => ((await hook('world()')).npcs ?? []).map((n) => n.body);

  console.log('9. Erneut mit Schnabbi sprechen: keine zweite Belohnung, sein nächster Vorschlag beginnt');
  check((await page.locator('.hint').textContent())?.includes('Schnabbi hat eine Idee'), 'Hinweis auf das zweite Erlebnis');
  check((await button('Freunde').count()) === 1, 'Freundebuch ist in der Anzeige');
  await tapTile(9, 17);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await shot('ausflug-frage');
  await button('Lieber später').tap();
  await noPanel();
  s = await state();
  check(!s.quests[Q2] && s.moments.length === 1, '„Lieber später“: nichts begonnen, nichts doppelt');
  await tapTile(9, 17);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await button('Gern, zeig sie mir!').tap();
  await advanceDialogUntil('false');
  await noPanel();
  s = await state();
  check(s.moments.length === 1, 'weiterhin genau ein Moment');
  check(s.quests[Q2]?.step === 'hinueber' && s.recipesKnown.includes('recipe.schilfmatte'), 'Quest 2 gestartet, Rezept Schilfmatte gelernt');
  await page.waitForTimeout(1200);
  await shot('schnabbi-geht-vor');
  await waitFor('Schnabbi ist vorgegangen', `window.__otterwelt.world().npcs.length === 0 && window.__otterwelt.world().leavers === 0`, 20000);
  check(true, 'Schnabbi läuft zum Weg und verschwindet vom Startufer');
  await hook('flush()');

  console.log('10. Neuladen');
  await start();
  s = await state();
  check(s.quests['quest.schnabbi.licht'].done && s.deco[0].on, 'Endstand des ersten Abends bleibt nach Neuladen erhalten');
  check(s.quests[Q2].step === 'hinueber' && (await hook('world()')).npcs.length === 0, 'nach Neuladen: Schnabbi wartet weiterhin in der Bucht');
  check((await button('Weiterspielen').count()) === 1, 'Startbild bietet „Weiterspielen“');
  await button('Weiterspielen').tap();
  await noPanel();

  console.log('11. Über den Wegweiser in die Schilfbucht');
  await tapTile(14, 20);
  await inMap('map.schilfbucht');
  await page.waitForTimeout(500);
  s = await state();
  check(s.location.map === 'map.schilfbucht' && s.location.tile.x === 2 && s.location.tile.y === 24, 'in der Schilfbucht am Ankunftspunkt');
  check(s.quests[Q2].step === 'schilf', 'Ankunft schaltet die Quest weiter');
  check(JSON.stringify(await npcBodies()) === '["body.schnabbi"]', 'Schnabbi wartet in der Bucht (genau einmal)');
  await shot('schilfbucht');
  await page.locator('.hint').tap();
  await panel('quests');
  check((await page.locator('.quest.tracked .quest-name').textContent()) === 'Ein Platz für zwei', 'Hinweis antippen öffnet das Aufgabenbuch');
  check((await page.locator('.list-row.done').count()) === 1, 'Aufgabenbuch: der erste Abend steht unter „Erledigt“');
  await shot('aufgabenbuch');
  await button('Zurück').tap();
  await noPanel();
  await hook('flush()');

  console.log('12. Unterbrechen in der zweiten Map (Neuladen)');
  await start();
  s = await state();
  check(s.location.map === 'map.schilfbucht', 'nach Neuladen: wieder in der Schilfbucht');
  check((await hook('world()')).map === 'map.schilfbucht', 'nach Neuladen: Welt zeigt die Schilfbucht');
  await button('Weiterspielen').tap();
  await noPanel();

  console.log('13. Schilf sammeln');
  await tapTile(7, 17);
  await panel('dialog');
  await advanceDialogUntil('false');
  await noPanel();
  await tapTile(2, 12);
  await idle();
  await waitFor('Halm 1', `window.__otterwelt.state().inventory['item.schilfhalm'] === 1`);
  await tapTile(2, 6);
  await page.waitForTimeout(1200);
  await shot('schilf-schwimmen');
  await idle();
  await waitFor('Halm 2', `window.__otterwelt.state().inventory['item.schilfhalm'] === 2`);
  await tapTile(13, 12);
  await idle();
  await waitFor('Halm 3', `window.__otterwelt.state().inventory['item.schilfhalm'] === 3`);
  s = await state();
  check(s.quests[Q2].step === 'flechten', 'drei Halme: zurück zur Werkbank');
  await waitFor('Schnabbi geht zurück', `window.__otterwelt.world().npcs.length === 0 && window.__otterwelt.world().leavers === 0`, 20000);
  check(true, 'Schnabbi geht schon vor zum Ufer');

  console.log('14. Zurück zum Startufer');
  await tapTile(1, 24);
  await inMap('map.startufer');
  s = await state();
  check(s.location.map === 'map.startufer' && s.location.tile.x === 13 && s.location.tile.y === 22, 'zurück am Startufer am Ankunftspunkt');
  check(JSON.stringify(await npcBodies()) === '["body.schnabbi"]', 'Schnabbi sitzt wieder am Licht');
  await shot('zurueck-am-ufer');

  console.log('15. Matte flechten und hinlegen');
  await tapTile(11, 24);
  await panel('werkbank');
  await page.locator('.recipe', { hasText: 'Schilfmatte' }).getByRole('button', { name: 'Bauen' }).tap();
  await page.waitForTimeout(300);
  await button('Jetzt aufstellen').tap();
  await page.waitForTimeout(700);
  await tapTile(5, 21);
  await page.waitForTimeout(200);
  await shot('matte-platz');
  await button('Hier aufstellen').tap();
  await page.waitForTimeout(300);
  s = await state();
  check(s.quests[Q2].step === 'gemeinsam' && s.deco.some((d) => d.item === 'item.schilfmatte'), 'Matte liegt, Quest bei „gemeinsam“');

  console.log('16. Schnabbi kommt und vertraut dir');
  await panel('dialog');
  check(true, 'Schnabbi läuft zur Matte und spricht von selbst');
  await shot('vertrauen');
  await advanceDialogUntil('false');
  await panel('endcard');
  check((await page.locator('.unlock').textContent())?.includes('als Schnabbi spielen'), 'Abschlusskarte nennt die Freischaltung');
  await shot('abschluss-2');
  await button('Weiterspielen').tap();
  await noPanel();
  s = await state();
  check(s.quests[Q2].done && JSON.stringify(s.unlocked) === '["otter","schnabbi"]', 'Quest 2 fertig, Schnabbi spielbar');
  check(s.moments.length === 2, 'zwei Momente, keiner doppelt');

  console.log('17. Freundebuch: als Schnabbi spielen');
  await button('Freunde').tap();
  await panel('friends');
  await shot('freundebuch');
  await button('Als Schnabbi spielen').tap();
  await waitFor('als Schnabbi', `window.__otterwelt.world()?.player.body === 'body.schnabbi' && !window.__otterwelt.world().leaving`);
  await page.waitForTimeout(500);
  let w = await hook('world()');
  check(w.npcs.length === 1 && w.npcs[0].body === 'body.otter' && w.npcs[0].tile.x === 5 && w.npcs[0].tile.y === 25, 'Otter ruht vor dem Bau, kein zweiter Schnabbi');
  await shot('als-schnabbi');
  await tapTile(8, 20);
  await idle();
  s = await state();
  check(s.activeCharacter === 'schnabbi' && s.location.tile.x === 8 && s.location.tile.y === 20, 'Schnabbi läuft per Tippen');
  await hook('flush()');

  console.log('18. Neuladen als Schnabbi');
  await start();
  s = await state();
  w = await hook('world()');
  check(s.activeCharacter === 'schnabbi' && w.player.body === 'body.schnabbi', 'nach Neuladen: weiterhin als Schnabbi');
  await button('Weiterspielen').tap();
  await noPanel();

  console.log('19. Zurück zum Otter (Tipp auf den ruhenden Otter)');
  await tapTile(5, 25);
  await panel('friends');
  await button('Wieder als Otter spielen').tap();
  await waitFor('als Otter', `window.__otterwelt.world()?.player.body === 'body.otter' && !window.__otterwelt.world().leaving`);
  await page.waitForTimeout(500);
  w = await hook('world()');
  check(JSON.stringify(w.npcs.map((n) => n.body)) === '["body.schnabbi"]', 'wieder als Otter, Schnabbi sitzt an der Matte');
  await shot('wieder-otter');

  // ---------------- Grundbau: freies Sammeln, Bauen, Einpacken ----------------
  console.log('20. Schnabbi hat neue Ideen (Sprechblase)');
  check(w.npcs[0].news === true, 'Sprechblase über Schnabbi');
  const sch = w.npcs[0].tile;
  await tapTile(sch.x, sch.y);
  await panel('dialog');
  await advanceDialogUntil('false');
  await noPanel();
  s = await state();
  check(s.recipesKnown.includes('recipe.treibholzbank') && s.recipesKnown.includes('recipe.muschelwindspiel'), 'zwei neue Rezepte gelernt');
  check((await hook('world()')).npcs[0].news === false, 'Sprechblase ist weg');

  console.log('21. Treibholz wächst nach');
  const holz = () => page.evaluate(`window.__otterwelt.state().inventory['item.treibholz'] ?? 0`);
  check(!(await hook('world()')).spotsVisible.includes('spot.treibholz.strand'), 'eingesammeltes Treibholz ist noch weg');
  await hook('advanceMinutes(11)');
  await page.waitForTimeout(800);
  check((await hook('world()')).spotsVisible.includes('spot.treibholz.strand'), 'nach zehn Minuten ist neues Treibholz da');
  await shot('nachgewachsen');
  await tapTile(4, 17);
  await idle();
  await waitFor('Holz 1', `(window.__otterwelt.state().inventory['item.treibholz'] ?? 0) === 1`);
  await tapTile(6, 11);
  await idle();
  await waitFor('Holz 2', `(window.__otterwelt.state().inventory['item.treibholz'] ?? 0) === 2`);
  await hook('advanceMinutes(11)');
  await page.waitForTimeout(800);
  await tapTile(4, 17);
  await idle();
  await waitFor('Holz 3', `(window.__otterwelt.state().inventory['item.treibholz'] ?? 0) === 3`);
  check((await holz()) === 3, 'drei Treibholz gesammelt');

  console.log('22. Treibholzbank bauen und aufstellen');
  await tapTile(11, 24);
  await panel('werkbank');
  await shot('werkbank-frei');
  await page.locator('.recipe', { hasText: 'Treibholzbank' }).getByRole('button', { name: 'Bauen' }).tap();
  await page.waitForTimeout(300);
  await button('Jetzt aufstellen').tap();
  await page.waitForTimeout(700);
  await tapTile(8, 27);
  await page.waitForTimeout(200);
  await button('Hier aufstellen').tap();
  await page.waitForTimeout(400);
  s = await state();
  check(s.deco.some((d) => d.item === 'item.treibholzbank') && !s.inventory['item.treibholz'], 'Bank steht, Holz verbraucht');
  await shot('bank');

  console.log('23. Bank wieder einpacken');
  await button('Beutel').tap();
  await panel('bag');
  await shot('beutel-deko');
  await page.locator('.list-row', { hasText: 'Treibholzbank' }).getByRole('button', { name: 'Einpacken' }).tap();
  await page.waitForTimeout(300);
  s = await state();
  check(!s.deco.some((d) => d.item === 'item.treibholzbank') && s.inventory['item.treibholzbank'] === 1, 'Bank ist wieder im Beutel');
  await button('Zurück').tap();
  await noPanel();
  await hook('flush()');

  console.log('24. Neuladen: alles bleibt');
  await start();
  s = await state();
  check(s.inventory['item.treibholzbank'] === 1 && s.deco.length === 2 && s.recipesKnown.length === 4, 'nach Neuladen: Beutel, Deko und Rezepte stimmen');
  await button('Weiterspielen').tap();
  await noPanel();
  await button('Menü').tap();
  await button('Aufgaben').tap();
  await panel('quests');
  check((await page.locator('.list-row.done').count()) === 2, 'Aufgabenbuch: beide Erlebnisse erledigt');
  await shot('aufgabenbuch-ende');
  await button('Zurück').tap();
  await noPanel();

  // ---------------- Kapitel Tiramisu Stream: Lumi, Rosie und Bubbles ----------------
  const Q3 = 'quest.lumi.picknick';
  const Q4 = 'quest.rosie.kissen';
  const figur = async (body) => ((await hook('world()')).npcs ?? []).find((n) => n.body === body);

  console.log('25. Zum Tiramisu Stream');
  check((await page.locator('.hint').textContent())?.includes('Tiramisu Stream'), 'Hinweis auf den Tiramisu Stream');
  await tapTile(1, 26);
  await inMap('map.tiramisu-stream');
  await page.waitForTimeout(600);
  check((await figur('body.otterprinzessin'))?.news === true, 'Lumi ist da, mit Sprechblase');
  check(!!(await figur('body.rosie')) && !!(await figur('body.bubbles')), 'Rosie und Bubbles im Teich');
  await shot('tiramisu-stream');

  console.log('26. Lumi kennenlernen');
  await tapTile(12, 17);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await shot('lumi-frage');
  await button('Na klar!').tap();
  await advanceDialogUntil('false');
  await noPanel();
  s = await state();
  check(s.quests[Q3]?.step === 'sammeln' && s.recipesKnown.includes('recipe.bluetengirlande'), 'Picknick-Aufgabe angenommen');

  console.log('27. Blüten und Kiesel sammeln');
  const has = (item, n) => waitFor(`${item} ${n}`, `(window.__otterwelt.state().inventory['${item}'] ?? 0) >= ${n}`);
  await tapTile(12, 19);
  await idle();
  await has('item.wiesenbluete', 1);
  await tapTile(9, 16);
  await idle();
  await has('item.glitzerkiesel', 1);
  await tapTile(2, 14);
  await idle();
  await has('item.wiesenbluete', 2);
  await tapTile(11, 6);
  await idle();
  await has('item.wiesenbluete', 3);
  s = await state();
  check(s.quests[Q3].step === 'basteln', 'alles beisammen');

  console.log('28. Blütengirlande am Bastelstumpf');
  await tapTile(11, 21);
  await panel('werkbank');
  check((await page.locator('.sheet h2').textContent()) === 'Bastelstumpf', 'der Bastelstumpf ist eine eigene Station');
  await page.locator('.recipe', { hasText: 'Blütengirlande' }).getByRole('button', { name: 'Bauen' }).tap();
  await page.waitForTimeout(300);
  await button('Jetzt aufstellen').tap();
  await page.waitForTimeout(700);
  await tapTile(12, 13);
  await page.waitForTimeout(200);
  await button('Hier aufstellen').tap();
  await page.waitForTimeout(300);
  s = await state();
  check(s.quests[Q3].step === 'picknick', 'Girlande hängt');

  console.log('29. Picknick mit Lumi');
  await panel('dialog');
  check(true, 'Lumi kommt zur Girlande und spricht von selbst');
  await shot('picknick');
  await advanceDialogUntil('false');
  await panel('endcard');
  check((await page.locator('.unlock').textContent())?.includes('Lumi'), 'Abschlusskarte: Lumi ist spielbar');
  await button('Weiterspielen').tap();
  await noPanel();
  s = await state();
  check(s.quests[Q3].done && s.unlocked.includes('otterprinzessin') && s.recipesKnown.includes('recipe.kiesellicht'), 'Picknick fertig, Kiesellicht-Rezept gelernt');
  check((await hook('world()')).bubblesMade > 0, 'Bubbles macht Blasen');

  console.log('30. Rosie und Bubbles');
  check((await figur('body.rosie'))?.news === true, 'Sprechblase über Rosie');
  await tapTile(3, 6);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await shot('rosie-frage');
  await button('Mach ich!').tap();
  await advanceDialogUntil('false');
  await noPanel();
  s = await state();
  check(s.quests[Q4]?.step === 'sammeln', 'Kissen-Aufgabe angenommen');
  await tapTile(2, 5);
  await idle();
  await has('item.seerosenblatt', 1);
  await tapTile(7, 8);
  await idle();
  await has('item.seerosenblatt', 2);
  await hook('advanceMinutes(11)');
  await page.waitForTimeout(800);
  await tapTile(2, 14);
  await idle();
  await has('item.wiesenbluete', 1);
  s = await state();
  check(s.quests[Q4].step === 'basteln', 'Seerosenblätter und Blüte beisammen');
  await tapTile(11, 21);
  await panel('werkbank');
  await page.locator('.recipe', { hasText: 'Seerosenkissen' }).getByRole('button', { name: 'Bauen' }).tap();
  await page.waitForTimeout(300);
  await button('Später').tap();
  await noPanel();
  await tapTile(3, 6);
  await panel('dialog');
  await advanceDialogUntil('false');
  await panel('endcard');
  await shot('kissen-fuer-rosie');
  await button('Weiterspielen').tap();
  await noPanel();
  s = await state();
  check(s.quests[Q4].done && !s.inventory['item.seerosenkissen'] && (s.inventory['item.glitzerkiesel'] ?? 0) >= 2, 'Kissen abgegeben, zwei Glitzerkiesel geschenkt');

  console.log('31. Freundebuch: als Lumi spielen');
  await button('Freunde').tap();
  await panel('friends');
  check((await page.locator('.friend-name').allTextContents()).join(',') === 'Lina,Schnabbi,Lumi,Rosie,Bubbles', 'Freundebuch: alle fünf');
  await shot('freundebuch-voll');
  await button('Als Lumi spielen').tap();
  await waitFor('als Lumi', `window.__otterwelt.world()?.player.body === 'body.otterprinzessin' && !window.__otterwelt.world().leaving`);
  await page.waitForTimeout(500);
  check(!(await figur('body.otterprinzessin')), 'Lumi steht nicht zusätzlich herum');
  await shot('als-lumi');
  await hook('flush()');

  console.log('32. Neuladen am Bach');
  await start();
  s = await state();
  check(s.location.map === 'map.tiramisu-stream' && s.activeCharacter === 'otterprinzessin', 'nach Neuladen: am Bach, als Lumi');
  check(s.moments.length === 5, 'fünf Momente, keiner doppelt');
  await button('Weiterspielen').tap();
  await noPanel();

  // ---------------- Kapitel Zoo: Meerkat und Squichy ----------------
  console.log('33. Wieder als Otter, Treibholz am Startufer');
  await button('Freunde').tap();
  await panel('friends');
  await button('Wieder als Otter spielen').tap();
  await waitFor('als Otter', `window.__otterwelt.world()?.player.body === 'body.otter' && !window.__otterwelt.world().leaving`);
  await tapTile(14, 26);
  await inMap('map.startufer');
  check((await page.locator('.hint').textContent())?.includes('Zoo'), 'Hinweis auf den Zoo');
  await hook('advanceMinutes(11)');
  await page.waitForTimeout(800);
  await tapTile(4, 17);
  await idle();
  await has('item.treibholz', 1);

  console.log('34. In den Zoo');
  await tapTile(9, 30);
  await inMap('map.zoo');
  await page.waitForTimeout(600);
  check((await figur('body.meerkat'))?.news === true && !!(await figur('body.squichy')), 'Meerkat mit Sprechblase, Squichy im Becken');
  await shot('zoo');

  console.log('35. Ein Wimpel für Meerkat');
  await tapTile(4, 6);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await button('Klar!').tap();
  await advanceDialogUntil('false');
  await noPanel();
  await tapTile(4, 10);
  await idle();
  await has('item.feder', 1);
  await tapTile(3, 15);
  await idle();
  await has('item.feder', 2);
  s = await state();
  check(s.quests['quest.meerkat.wimpel']?.step === 'basteln', 'Federn und Treibholz beisammen');
  await tapTile(11, 23);
  await panel('werkbank');
  await page.locator('.recipe', { hasText: 'Federwimpel' }).getByRole('button', { name: 'Bauen' }).tap();
  await page.waitForTimeout(300);
  await button('Später').tap();
  await noPanel();
  await tapTile(4, 6);
  await panel('dialog');
  await advanceDialogUntil('false');
  await panel('endcard');
  await button('Weiterspielen').tap();
  await noPanel();
  await page.waitForTimeout(500);
  s = await state();
  check(s.quests['quest.meerkat.wimpel'].done && s.inventory['item.sonnenblumenkern'] === 2, 'Wimpel abgegeben, zwei Sonnenblumenkerne geschenkt');
  const stein = (await hook('world()')).objects.find((o) => o.id === 'obj.aussichtsstein');
  check(stein?.sprite === 'objects.aussichtsstein.wimpel', 'der Wimpel steht jetzt auf dem Aussichtsstein');
  await shot('meerkat-wimpel');

  console.log('36. Squichy kennenlernen');
  check((await figur('body.squichy'))?.news === true, 'Sprechblase über Squichy');
  await tapTile(11, 14);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await shot('squichy-frage');
  await button('Mach ich!').tap();
  await advanceDialogUntil('false');
  await noPanel();
  s = await state();
  check(s.quests['quest.squichy.ball']?.step === 'basteln' || s.quests['quest.squichy.ball']?.step === 'sammeln', 'Ball-Aufgabe angenommen');
  await hook('flush()');

  console.log('37. Neuladen im Zoo');
  await start();
  s = await state();
  check(s.location.map === 'map.zoo' && s.quests['quest.meerkat.wimpel'].done, 'nach Neuladen: im Zoo, Meerkats Aufgabe bleibt erledigt');
  check(((await hook('world()')).objects.find((o) => o.id === 'obj.aussichtsstein'))?.sprite === 'objects.aussichtsstein.wimpel', 'nach Neuladen: Wimpel auf dem Stein');
  await button('Weiterspielen').tap();
  await noPanel();

  // ---------------- Kapitel Cat Café: Chamaron ----------------
  console.log('38. Ins Cat Café: Chamaron ist getarnt');
  await tapTile(6, 30);
  await inMap('map.cat-cafe');
  await page.waitForTimeout(600);
  w = await hook('world()');
  check(w.camouflaged.includes('body.chamaron') && !(await figur('body.chamaron'))?.news, 'Chamaron ist getarnt und verrät sich nicht durch eine Sprechblase');
  await shot('cat-cafe');
  await tapTile(13, 13);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await button('Ich bastel dir eine!').tap();
  await advanceDialogUntil('false');
  await noPanel();
  await page.waitForTimeout(300);
  check(!(await hook('world()')).camouflaged.includes('body.chamaron'), 'gefunden: Chamaron ist nicht mehr getarnt (wechselt die Farbe)');

  console.log('39. Kletterpflanze für Chamaron');
  await tapTile(2, 2);
  await idle();
  await has('item.teeblatt', 1);
  await tapTile(13, 2);
  await idle();
  await has('item.teeblatt', 2);
  await tapTile(7, 9);
  await idle();
  await has('item.wollfaden', 1);
  await tapTile(11, 4);
  await panel('werkbank');
  check((await page.locator('.sheet h2').textContent()) === 'Basteltisch', 'Basteltisch im Café');
  await page.locator('.recipe', { hasText: 'Kletterpflanze' }).getByRole('button', { name: 'Bauen' }).tap();
  await page.waitForTimeout(300);
  await button('Jetzt aufstellen').tap();
  await page.waitForTimeout(700);
  await tapTile(8, 14);
  await page.waitForTimeout(200);
  await button('Hier aufstellen').tap();
  await panel('dialog');
  check(true, 'Chamaron klettert hinein und spricht von selbst');
  await shot('chamaron-pflanze');
  await advanceDialogUntil('false');
  await panel('endcard');
  await button('Weiterspielen').tap();
  await noPanel();
  s = await state();
  check(s.quests['quest.chamaron.kletterpflanze'].done && s.recipesKnown.includes('recipe.wollkissen'), 'Chamarons Aufgabe erledigt, Rezept Wollkissen');

  // ---------------- Kapitel Hotpot-Restaurant: Beano, Beani, Beanz ----------------
  console.log('40. Ins Hotpot-Restaurant');
  await tapTile(7, 29);
  await inMap('map.zoo');
  await tapTile(10, 27);
  await idle();
  await tapTile(14, 23);
  await inMap('map.hotpot-restaurant');
  await page.waitForTimeout(600);
  const schale = await figur('body.erbsenschale');
  check(schale?.news === true, 'die Erbsenschale mit Sprechblase');
  await shot('hotpot');
  await tapTile(8, 9);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await shot('erbsen-frage');
  await button('Na klar, ich koche!').tap();
  await advanceDialogUntil('false');
  await noPanel();
  await tapTile(11, 3);
  await idle();
  await has('item.mehl', 1);
  await tapTile(13, 3);
  await idle();
  await has('item.mehl', 2);
  await tapTile(2, 3);
  await idle();
  await has('item.moehrchen', 1);
  await tapTile(7, 3);
  await panel('werkbank');
  check((await page.locator('.sheet h2').textContent()) === 'Kochtopf', 'der Kochtopf ist eine eigene Station');
  await page.locator('.recipe', { hasText: 'Teigtaschen' }).getByRole('button', { name: 'Bauen' }).tap();
  await page.waitForTimeout(300);
  await button('Später').tap();
  await noPanel();
  await tapTile(8, 9);
  await panel('dialog');
  await advanceDialogUntil('false');
  await panel('endcard');
  await shot('festessen');
  await button('Weiterspielen').tap();
  await noPanel();
  s = await state();
  check(
    s.quests['quest.erbsen.festessen'].done && ['beano', 'beani', 'beanz'].every((e) => s.moments.includes(`moment.${e}.festessen`)),
    'Festessen: ein Moment für jede Erbse',
  );

  // ---------------- Kapitel Fuchsbau: Bean ----------------
  console.log('41. Durch Zoo, Ufer und Bach in den Wald');
  await tapTile(7, 29);
  await inMap('map.zoo');
  await tapTile(9, 1); // Wegweiser oben im Zoo
  await inMap('map.startufer');
  await tapTile(1, 26);
  await inMap('map.tiramisu-stream');
  await tapTile(13, 1);
  await inMap('map.fuchsbau');
  await page.waitForTimeout(600);
  check((await figur('body.bean'))?.news === true, 'Bean mit Sprechblase');
  await shot('fuchsbau');
  await tapTile(8, 12);
  await panel('dialog');
  await advanceDialogUntil(`!!document.querySelector('.choices')`);
  await button('Sehr gern!').tap();
  await advanceDialogUntil('false');
  await noPanel();
  s = await state();
  check(s.quests['quest.bean.kranz']?.step === 'sammeln', 'Beans Kranz-Aufgabe angenommen');

  console.log('42. Freundebuch und Neuladen im Wald');
  await button('Freunde').tap();
  await panel('friends');
  const namen = await page.locator('.friend-name').allTextContents();
  check(namen.length === 12 && ['Chamaron', 'Beano', 'Beani', 'Beanz', 'Bean'].every((n) => namen.includes(n)), `Freundebuch: zwölf Figuren (${namen.join(', ')})`);
  await shot('freundebuch-alle');
  await button('Zurück').tap();
  await noPanel();
  await hook('flush()');
  await start();
  s = await state();
  check(s.location.map === 'map.fuchsbau' && s.quests['quest.bean.kranz']?.step === 'sammeln', 'nach Neuladen: im Wald, Aufgabe bleibt');

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

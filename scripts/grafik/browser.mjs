// Gemeinsamer Rahmen für die Grafik-Werkzeuge: Bildverarbeitung läuft im Canvas eines unsichtbaren Chromium
// (Playwright ist für die Browser-Tests ohnehin installiert). Node liest und schreibt nur Dateien.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
/** Codex-Arbeitsordner (nur lesen, nie schreiben). */
export const DESIGN = resolve(here, '../../../otter-design/arbeit');
export const PUBLIC = resolve(here, '../../public');

export async function openPixelPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');
  await page.addScriptTag({ content: readFileSync(resolve(here, 'pixel.js'), 'utf8') });
  const loaded = new Map();
  return {
    page,
    /** Lädt eine Datei einmal in die Seite; danach per Name ansprechbar. */
    async load(name, file) {
      if (loaded.has(name)) return;
      const b64 = readFileSync(file).toString('base64');
      const mime = file.endsWith('.jpeg') || file.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
      await page.evaluate(([n, d]) => window.G.load(n, d), [name, `data:${mime};base64,${b64}`]);
      loaded.set(name, file);
    },
    async run(fn, arg) {
      return page.evaluate(fn, arg);
    },
    writePng(path, dataUrl) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, Buffer.from(dataUrl.split(',')[1], 'base64'));
    },
    close: () => browser.close(),
  };
}

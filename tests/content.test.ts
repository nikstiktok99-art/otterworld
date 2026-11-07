import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { content } from './helpers';
import { validateContent } from '../src/content/validate';
import { assetKeys } from '../src/assets/catalog';
import type { Content } from '../src/content/types';

describe('Inhaltsreferenzen', () => {
  it('der echte Inhalt ist fehlerfrei', () => {
    expect(validateContent(content, assetKeys())).toEqual([]);
  });

  it('findet fehlende Referenzen', () => {
    const broken: Content = JSON.parse(JSON.stringify(content));
    broken.characters.schnabbi!.body = 'body.gibtsnicht';
    broken.recipes['recipe.uferleuchte']!.inputs['item.sternenstaub'] = 1;
    broken.dialogues[0]!.effects = [{ startQuest: 'quest.gibtsnicht' }];
    const errors = validateContent(broken, assetKeys());
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('body.gibtsnicht'),
        expect.stringContaining('item.sternenstaub'),
        expect.stringContaining('quest.gibtsnicht'),
      ]),
    );
  });

  it('Datenmodell für geteilte Körper: drei Erbsen in einer Schale sind gültig, doppelte Sitzplätze nicht', () => {
    const c: Content = JSON.parse(JSON.stringify(content));
    c.bodies['body.erbsenschale'] = { id: 'body.erbsenschale', sprite: 'characters.otter', moves: ['land'], speed: { land: 30, water: 0 }, seats: 3 };
    for (const [i, id] of ['beano', 'beani', 'beanz'].entries()) {
      c.characters[id] = { id, name: id, body: 'body.erbsenschale', seat: i };
    }
    expect(validateContent(c, assetKeys())).toEqual([]);
    c.characters.beanz!.seat = 1;
    expect(validateContent(c, assetKeys())).toEqual([expect.stringContaining('doppelt')]);
  });
});

describe('Version', () => {
  it('src/app/version.ts passt zu package.json', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as { version: string };
    const src = readFileSync(join(__dirname, '..', 'src', 'app', 'version.ts'), 'utf8');
    expect(src).toContain(`VERSION = '${pkg.version}'`);
  });
});

describe('Modulgrenzen', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : [p];
    });

  it('src/game importiert nichts aus Phaser, React oder Capacitor', () => {
    for (const f of files(join(__dirname, '..', 'src', 'game'))) {
      const text = readFileSync(f, 'utf8');
      expect(text, f).not.toMatch(/from\s+['"](phaser|react|react-dom|@capacitor\/[^'"]+)['"]/);
    }
  });

  it('src/content importiert nichts aus Phaser, React oder Capacitor', () => {
    for (const f of files(join(__dirname, '..', 'src', 'content'))) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/from\s+['"](phaser|react|react-dom|@capacitor\/[^'"]+)['"]/);
    }
  });

  it('keine Emojis in Quelltext und Inhalten', () => {
    const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
    for (const f of files(join(__dirname, '..', 'src'))) {
      expect(emoji.test(readFileSync(f, 'utf8')), f).toBe(false);
    }
  });
});

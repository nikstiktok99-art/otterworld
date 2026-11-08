import { describe, expect, it } from 'vitest';
import { afterGreeting, allGathered, content, fresh, MAP, play } from './helpers';
import { decodeEnvelope, encodeEnvelope, exportCode, importCode } from '../src/game/save/codec';
import { normalizeState } from '../src/game/save/normalize';
import { SaveStore, type KeyValueStore } from '../src/app/saveStore';
import { SCHEMA } from '../src/game/state';

class MemoryStore implements KeyValueStore {
  data = new Map<string, string>();
  writes = 0;
  async get(k: string) {
    return this.data.get(k) ?? null;
  }
  async set(k: string, v: string) {
    this.writes++;
    await new Promise((r) => setTimeout(r, 1));
    this.data.set(k, v);
  }
  async remove(k: string) {
    this.data.delete(k);
  }
}

describe('Hülle und Prüfsumme', () => {
  it('erkennt beschädigte und neuere Stände', () => {
    const raw = encodeEnvelope(fresh(), 3, 0);
    expect(decodeEnvelope(raw).ok).toBe(true);
    expect(decodeEnvelope(raw.slice(0, -10))).toMatchObject({ ok: false, reason: 'corrupt' });
    expect(decodeEnvelope(raw.replace('"nextDecoId":1', '"nextDecoId":2'))).toMatchObject({ ok: false, reason: 'checksum' });
    expect(decodeEnvelope(raw.replace(`"schema":${SCHEMA}`, '"schema":99'))).toMatchObject({ ok: false, reason: 'newer' });
    expect(decodeEnvelope(null)).toMatchObject({ ok: false, reason: 'empty' });
  });
});

describe('Normalisieren', () => {
  it('füllt fehlende Felder mit Standardwerten', () => {
    const { state } = normalizeState({ player: { name: 'Lina' } }, 1, content);
    expect(state.player.name).toBe('Lina');
    expect(state.settings).toEqual({ sound: true, haptics: true });
    expect(state.location.tile).toEqual(content.maps[MAP]!.arrival);
  });

  it('verwirft unbekannte IDs statt abzustürzen', () => {
    const { state, notes } = normalizeState(
      { inventory: { 'item.gibtsnicht': 3, 'item.treibholz': 2 }, quests: { 'quest.weg': { step: 'x', done: false } } },
      1,
      content,
    );
    expect(state.inventory).toEqual({ 'item.treibholz': 2 });
    expect(state.quests).toEqual({});
    expect(notes.length).toBeGreaterThan(0);
  });

  it('setzt eine ungültige Position (z. B. im Bau) auf den Ankunftspunkt', () => {
    const s = fresh();
    const bad = { ...s, location: { map: MAP, tile: { x: 3, y: 23 }, facing: 'se' } };
    expect(normalizeState(bad, 1, content).state.location.tile).toEqual(content.maps[MAP]!.arrival);
  });

  it('ein normaler Stand bleibt unverändert', () => {
    const s = allGathered(afterGreeting());
    expect(normalizeState(JSON.parse(JSON.stringify(s)), 1, content).state).toEqual(s);
  });
});

describe('Spielstand-Code', () => {
  it('Hin und zurück ergibt denselben Stand, auch mit Umlauten im Namen', () => {
    const s = afterGreeting('Jöran');
    const back = importCode(exportCode(s));
    expect(normalizeState(back.state, back.schema, content).state).toEqual(s);
  });

  it('weist verfälschte Codes ab', () => {
    const code = exportCode(fresh());
    expect(() => importCode(code.slice(0, -1) + (code.endsWith('0') ? '1' : '0'))).toThrow();
    expect(() => importCode('hallo')).toThrow();
  });
});

describe('SaveStore', () => {
  it('Unterbrechen direkt nach dem Bauen: nach dem Neuladen ist die Leuchte im Beutel und die Zutaten sind weg', async () => {
    const mem = new MemoryStore();
    const store = new SaveStore(mem);
    const crafted = play(allGathered(afterGreeting()), { type: 'craft', recipe: 'recipe.uferleuchte' }).state;
    store.request(crafted);
    await store.flush();
    const loaded = await new SaveStore(mem).load(content);
    expect(loaded.state?.inventory).toEqual({ 'item.uferleuchte': 1 });
    expect(loaded.state?.quests['quest.schnabbi.licht']?.step).toBe('aufstellen');
  });

  it('Unterbrechen direkt nach dem Aufstellen: Leuchte steht, Schritt ist „abend“, Belohnung kommt danach genau einmal', async () => {
    const mem = new MemoryStore();
    const store = new SaveStore(mem);
    const placed = play(allGathered(afterGreeting()), { type: 'craft', recipe: 'recipe.uferleuchte' }, {
      type: 'placeDeco',
      item: 'item.uferleuchte',
      map: MAP,
      tile: { x: 8, y: 17 },
    }).state;
    store.request(placed);
    await store.flush();
    const loaded = (await new SaveStore(mem).load(content)).state!;
    expect(loaded.deco).toHaveLength(1);
    expect(loaded.quests['quest.schnabbi.licht']?.step).toBe('abend');
    const fin = play(
      loaded,
      { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' },
      { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' },
    );
    expect(fin.state.moments).toEqual(['moment.schnabbi.erster-abend']);
  });

  it('schreibt nacheinander, fasst schnelle Wünsche zusammen und lädt den neuesten Stand', async () => {
    const mem = new MemoryStore();
    const store = new SaveStore(mem);
    let s = fresh();
    for (let i = 0; i < 10; i++) {
      s = play(s, { type: 'setSetting', key: 'sound', value: i % 2 === 0 }).state;
      store.request(s);
    }
    await store.flush();
    expect(mem.writes).toBeLessThan(10);
    const loaded = await new SaveStore(mem).load(content);
    expect(loaded.state?.settings.sound).toBe(s.settings.sound);
  });

  it('ist der neueste Platz beschädigt, wird der ältere gültige geladen', async () => {
    const mem = new MemoryStore();
    const store = new SaveStore(mem);
    const a = afterGreeting('Lina');
    store.request(a);
    await store.flush();
    const b = play(a, { type: 'gather', map: MAP, spot: 'spot.treibholz.strand' }).state;
    store.request(b);
    await store.flush();
    // Den zuletzt geschriebenen Platz beschädigen (abgebrochener Schreibvorgang)
    const newest = [...mem.data.entries()].find(([, v]) => JSON.parse(v).seq === 2)!;
    mem.data.set(newest[0], newest[1].slice(0, 40));
    const loaded = await new SaveStore(mem).load(content);
    expect(loaded.state?.player.name).toBe('Lina');
    expect(loaded.state?.inventory).toEqual({});
  });

  it('überschreibt keinen Stand aus einer neueren Spielversion', async () => {
    const mem = new MemoryStore();
    mem.data.set('otterwelt.save.a', JSON.stringify({ schema: 99, seq: 5, savedAt: 0, check: 'x', state: {} }));
    const store = new SaveStore(mem);
    const res = await store.load(content);
    expect(res.problem).toBe('newer');
    store.request(fresh());
    await store.flush();
    expect(mem.writes).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { afterGreeting, allGathered, content, fresh, MAP, play, rejected } from './helpers';
import { checkPlacement } from '../src/game/rules/placement';
import { cleanName } from '../src/game/rules/name';
import { resolveNpcs } from '../src/game/occupancy';
import { selectDialogue } from '../src/game/text';

describe('Sammeln', () => {
  it('gibt pro Fundstelle genau einmal etwas – auch bei schnellem Doppeltipp', () => {
    const { state, events } = play(
      fresh(),
      { type: 'gather', map: MAP, spot: 'spot.treibholz.strand' },
      { type: 'gather', map: MAP, spot: 'spot.treibholz.strand' },
    );
    expect(state.inventory['item.treibholz']).toBe(1);
    expect(rejected(events)).toEqual([expect.objectContaining({ reason: 'alreadyGathered' })]);
  });

  it('ist auch vor dem Gespräch mit Schnabbi möglich, die Quest erkennt die Zutaten später', () => {
    const s = allGathered(fresh());
    const { state } = play(s, { type: 'setPlayerName', name: 'Lina' }, { type: 'finishDialogue', dialogue: 'dlg.schnabbi.begruessung' });
    expect(state.quests['quest.schnabbi.licht']).toEqual({ step: 'bauen', done: false });
  });
});

describe('Werkbank', () => {
  it('baut nur mit bekanntem Rezept', () => {
    const { events } = play(allGathered(fresh()), { type: 'craft', recipe: 'recipe.uferleuchte' });
    expect(rejected(events)[0]).toMatchObject({ reason: 'recipeUnknown' });
  });

  it('verweigert ohne genug Zutaten und ändert dann nichts', () => {
    const s = afterGreeting();
    const r = play(s, { type: 'craft', recipe: 'recipe.uferleuchte' });
    expect(r.state).toBe(s);
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'missingItems' });
  });

  it('verbraucht Zutaten und liefert die Leuchte in einem Schritt', () => {
    const s = allGathered(afterGreeting());
    const { state } = play(s, { type: 'craft', recipe: 'recipe.uferleuchte' });
    expect(state.inventory).toEqual({ 'item.uferleuchte': 1 });
    expect(state.quests['quest.schnabbi.licht']?.step).toBe('aufstellen');
  });

  it('zweimal schnell bauen ergibt genau eine Leuchte', () => {
    const s = allGathered(afterGreeting());
    const { state, events } = play(s, { type: 'craft', recipe: 'recipe.uferleuchte' }, { type: 'craft', recipe: 'recipe.uferleuchte' });
    expect(state.inventory['item.uferleuchte']).toBe(1);
    expect(rejected(events)).toHaveLength(1);
  });
});

describe('Deko aufstellen', () => {
  const withLamp = () => play(allGathered(afterGreeting()), { type: 'craft', recipe: 'recipe.uferleuchte' }).state;

  it('lehnt Wasser, Steg, Gebüsch, Bau und Werkbank ab', () => {
    const s = withLamp();
    expect(checkPlacement(s, content, MAP, { x: 5, y: 5 })?.reason).toBe('outsideZone'); // Wasser weit draußen
    expect(checkPlacement(s, content, MAP, { x: 6, y: 15 })?.reason).toBe('notPlaceable'); // Wasser in der Zone
    expect(checkPlacement(s, content, MAP, { x: 10, y: 15 })?.reason).toBe('notPlaceable'); // Steg
    expect(checkPlacement(s, content, MAP, { x: 0, y: 20 })?.reason).toBe('outsideZone'); // Gebüsch am Rand
    expect(checkPlacement(s, content, MAP, { x: 3, y: 23 })?.reason).toBe('occupied'); // Bau
    expect(checkPlacement(s, content, MAP, { x: 11, y: 24 })?.reason).toBe('occupied'); // Werkbank
  });

  it('lehnt die Kachel direkt vor dem Steg ab, weil der Steg sonst zu Fuß unerreichbar wäre', () => {
    const s = withLamp();
    expect(checkPlacement(s, content, MAP, { x: 10, y: 16 })).toEqual({ reason: 'blocksPath', detail: 'den Steg' });
  });

  it('erlaubt einen freien Platz auf dem Sand und schaltet die Quest weiter', () => {
    const s = withLamp();
    const { state, events } = play(s, { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: { x: 8, y: 17 } });
    expect(rejected(events)).toHaveLength(0);
    expect(state.deco).toEqual([{ uid: 'deco-1', item: 'item.uferleuchte', map: MAP, tile: { x: 8, y: 17 }, on: false }]);
    expect(state.inventory['item.uferleuchte']).toBeUndefined();
    expect(state.quests['quest.schnabbi.licht']?.step).toBe('abend');
  });

  it('ohne Leuchte im Beutel lässt sich nichts aufstellen (kein zweites Aufstellen)', () => {
    const s = withLamp();
    const { state, events } = play(
      s,
      { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: { x: 8, y: 17 } },
      { type: 'placeDeco', item: 'item.uferleuchte', map: MAP, tile: { x: 7, y: 17 } },
    );
    expect(state.deco).toHaveLength(1);
    expect(rejected(events)[0]).toMatchObject({ reason: 'notInInventory' });
  });
});

describe('Schnabbi und der Abschluss', () => {
  const placed = () =>
    play(allGathered(afterGreeting()), { type: 'craft', recipe: 'recipe.uferleuchte' }, {
      type: 'placeDeco',
      item: 'item.uferleuchte',
      map: MAP,
      tile: { x: 8, y: 17 },
    }).state;

  it('steht anfangs am Stegende und setzt sich nach dem Aufstellen neben die Leuchte', () => {
    expect(resolveNpcs(fresh(), content, MAP)).toEqual([
      expect.objectContaining({ body: 'body.schnabbi', tile: { x: 10, y: 8 }, pose: 'idle' }),
    ]);
    const npcs = resolveNpcs(placed(), content, MAP);
    expect(npcs).toEqual([expect.objectContaining({ body: 'body.schnabbi', tile: { x: 9, y: 17 }, pose: 'sit' })]);
  });

  it('der Abschluss schaltet die Leuchte an und gibt den Moment genau einmal', () => {
    const s = placed();
    expect(selectDialogue('schnabbi', s, content)?.id).toBe('dlg.schnabbi.abschluss');
    const { state, events } = play(
      s,
      { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' },
      { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' },
    );
    expect(state.quests['quest.schnabbi.licht']).toEqual({ step: 'abend', done: true });
    expect(state.deco[0]?.on).toBe(true);
    expect(state.moments).toEqual(['moment.schnabbi.erster-abend']);
    expect(events.filter((e) => e.type === 'momentGained')).toHaveLength(1);
    expect(events.filter((e) => e.type === 'questDone')).toHaveLength(1);
  });

  it('die Leuchte lässt sich erst nach dem Abschluss selbst an- und ausschalten', () => {
    const s = placed();
    expect(rejected(play(s, { type: 'toggleDeco', uid: 'deco-1' }).events)[0]).toMatchObject({ reason: 'notYet' });
    const done = play(s, { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' }).state;
    const off = play(done, { type: 'toggleDeco', uid: 'deco-1' }).state;
    expect(off.deco[0]?.on).toBe(false);
  });

  it('versetzt die Leuchte und Schnabbi setzt sich wieder dazu', () => {
    const done = play(placed(), { type: 'finishDialogue', dialogue: 'dlg.schnabbi.abschluss' }).state;
    const moved = play(done, { type: 'moveDeco', uid: 'deco-1', tile: { x: 5, y: 21 } }).state;
    expect(moved.deco[0]?.tile).toEqual({ x: 5, y: 21 });
    expect(resolveNpcs(moved, content, MAP)[0]?.tile).toEqual({ x: 6, y: 21 });
  });

  it('erneutes Beenden der Begrüßung startet nichts doppelt', () => {
    const s = afterGreeting();
    const again = play(s, { type: 'finishDialogue', dialogue: 'dlg.schnabbi.begruessung' });
    expect(again.state).toBe(s);
    expect(s.recipesKnown).toEqual(['recipe.uferleuchte']);
  });
});

describe('Name', () => {
  it('bereinigt und prüft Namen', () => {
    expect(cleanName('  Lina  ')).toBe('Lina');
    expect(cleanName('Anna-Lena')).toBe('Anna-Lena');
    expect(cleanName('Zoë')).toBe('Zoë');
    expect(cleanName('Jöran   Ü')).toBe('Jöran Ü');
    expect(cleanName('')).toBeNull();
    expect(cleanName('   ')).toBeNull();
    expect(cleanName('a'.repeat(17))).toBeNull();
    expect(cleanName('<script>')).toBeNull();
    expect(cleanName('Otter\u{1F9A6}')).toBeNull();
  });

  it('nach der Namenswahl wählt Schnabbi den Wiedersehens-Dialog statt erneut zu fragen', () => {
    const s = play(fresh(), { type: 'setPlayerName', name: 'Lina' }).state;
    expect(selectDialogue('schnabbi', s, content)?.id).toBe('dlg.schnabbi.wiedersehen');
  });
});

// Kapitel Cat Café (Chamaron), Hotpot-Restaurant (Erbsentrio, Kochtopf) und Fuchsbau (Bean).
import { describe, expect, it } from 'vitest';
import { content, fresh, MAP, play, rejected, T0 } from './helpers';
import { BACH, CAFE, cafeDone, HOTPOT, hotpotDone, travel, WALD, ZOO, zooDone } from './progress';
import type { GameState } from '../src/game/types';
import { resolveAllNpcs, resolveNpcs } from '../src/game/occupancy';
import { friendList, hasNews, questLog, selectDialogue } from '../src/game/text';

const MIN = 60_000;
const late = T0 + 500 * MIN;

describe('Wege zu den neuen Orten', () => {
  it('Zoo ↔ Cat Café, Zoo ↔ Hotpot-Restaurant, Tiramisu Stream ↔ Fuchsbau', () => {
    let s = travel(fresh(), MAP, { x: 7, y: 31 }, 'exit.zum-zoo');
    s = travel(s, ZOO, { x: 7, y: 31 }, 'exit.zum-cafe');
    expect(s.location).toEqual({ map: CAFE, tile: { x: 7, y: 28 }, facing: 'ne' });
    s = travel(s, CAFE, { x: 7, y: 29 }, 'exit.zum-zoo');
    expect(s.location.tile).toEqual({ x: 7, y: 30 });
    s = travel(s, ZOO, { x: 14, y: 24 }, 'exit.zum-hotpot');
    expect(s.location).toEqual({ map: HOTPOT, tile: { x: 7, y: 28 }, facing: 'ne' });
    s = travel(s, HOTPOT, { x: 7, y: 29 }, 'exit.zum-zoo');
    expect(s.location).toEqual({ map: ZOO, tile: { x: 13, y: 24 }, facing: 'sw' });
    let w = travel(fresh(), MAP, { x: 1, y: 27 }, 'exit.zum-bach');
    w = travel(w, BACH, { x: 11, y: 0 }, 'exit.zum-wald');
    expect(w.location).toEqual({ map: WALD, tile: { x: 7, y: 28 }, facing: 'ne' });
    w = travel(w, WALD, { x: 7, y: 29 }, 'exit.zum-bach');
    expect(w.location).toEqual({ map: BACH, tile: { x: 11, y: 1 }, facing: 'se' });
  });
});

describe('Cat Café: Ein Versteck für Chamaron', () => {
  it('vorher raschelt es nur, nach Meerkats Wimpel kann man Chamaron finden', () => {
    expect(selectDialogue('chamaron', fresh(), content)?.id).toBe('dlg.chamaron.fremd');
    const s = zooDone();
    expect(selectDialogue('chamaron', s, content)?.id).toBe('dlg.chamaron.hallo');
    expect(questLog(s, content).offers.map((q) => q.id)).toContain('quest.chamaron.kletterpflanze');
    expect(content.bodies['body.chamaron']!.traits).toContain('farbwechsel');
  });

  it('Teeblätter und Wolle, Kletterpflanze basteln und aufstellen: Chamaron klettert hinein', () => {
    let s = travel(zooDone(), ZOO, { x: 7, y: 31 }, 'exit.zum-cafe');
    s = play(
      s,
      { type: 'finishDialogue', dialogue: 'dlg.chamaron.hallo' },
      { type: 'gather', map: CAFE, spot: 'spot.tee.links', at: late },
      { type: 'gather', map: CAFE, spot: 'spot.tee.rechts', at: late },
      { type: 'gather', map: CAFE, spot: 'spot.wolle.oben', at: late },
      { type: 'craft', recipe: 'recipe.kletterpflanze' },
      { type: 'placeDeco', item: 'item.kletterpflanze', map: CAFE, tile: { x: 8, y: 14 } },
    ).state;
    expect(s.quests['quest.chamaron.kletterpflanze']?.step).toBe('gemeinsam');
    expect(resolveNpcs(s, content, CAFE).find((n) => n.body === 'body.chamaron')).toMatchObject({ tile: { x: 9, y: 14 }, talk: true });
  });

  it('am Ende: Moment und Rezept Wollkissen genau einmal', () => {
    const s = cafeDone();
    expect(s.quests['quest.chamaron.kletterpflanze']?.done).toBe(true);
    expect(s.moments.filter((m) => m === 'moment.chamaron.kletterpflanze')).toHaveLength(1);
    expect(s.recipesKnown).toContain('recipe.wollkissen');
    expect(friendList(s, content)).toContain('chamaron');
  });
});

describe('Hotpot-Restaurant: Ein Festessen für drei', () => {
  it('im Restaurant steht genau eine Schale mit allen drei Erbsen', () => {
    const bowls = resolveAllNpcs(fresh(), content).filter((n) => n.body === 'body.erbsenschale');
    expect(bowls).toHaveLength(1);
    expect(bowls[0]).toMatchObject({ map: HOTPOT, characters: ['beano', 'beani', 'beanz'] });
  });

  it('nach Chamarons Pflanze haben die Erbsen etwas für dich; jede spricht mit eigener Stimme', () => {
    const s = cafeDone();
    expect(hasNews('beano', s, content)).toBe(true);
    const dlg = selectDialogue('beano', s, content)!;
    expect(dlg.id).toBe('dlg.beano.hallo');
    const speakers = new Set(dlg.lines.flatMap((l) => ('speaker' in l && l.speaker ? [l.speaker] : [])));
    expect([...speakers].sort()).toEqual(['beani', 'beano', 'beanz']);
  });

  it('Teigtaschen gibt es nur am Kochtopf, nicht an der Werkbank', () => {
    let s = travel(cafeDone(), CAFE, { x: 7, y: 29 }, 'exit.zum-zoo');
    s = travel(s, ZOO, { x: 14, y: 24 }, 'exit.zum-hotpot');
    s = play(
      s,
      { type: 'finishDialogue', dialogue: 'dlg.beano.hallo' },
      { type: 'gather', map: HOTPOT, spot: 'spot.mehl.links', at: late },
      { type: 'gather', map: HOTPOT, spot: 'spot.mehl.rechts', at: late },
      { type: 'gather', map: HOTPOT, spot: 'spot.gemuese.links', at: late },
    ).state;
    expect(s.quests['quest.erbsen.festessen']?.step).toBe('kochen');
    expect(rejected(play(s, { type: 'craft', recipe: 'recipe.teigtaschen' }).events)[0]).toMatchObject({ reason: 'wrongStation' });
    const cooked = play(s, { type: 'craft', recipe: 'recipe.teigtaschen', station: 'kochtopf' }).state;
    expect(cooked.inventory['item.teigtaschen']).toBe(1);
    expect(cooked.quests['quest.erbsen.festessen']?.step).toBe('bringen');
  });

  it('am Ende: drei Momente (einer pro Erbse), Rezept Kräutersuppe, alle drei im Freundebuch', () => {
    const s = hotpotDone();
    expect(s.quests['quest.erbsen.festessen']?.done).toBe(true);
    expect(s.inventory['item.teigtaschen']).toBeUndefined();
    expect(s.moments).toEqual(expect.arrayContaining(['moment.beano.festessen', 'moment.beani.festessen', 'moment.beanz.festessen']));
    expect(s.recipesKnown).toContain('recipe.kraeutersuppe');
    expect(friendList(s, content)).toEqual(expect.arrayContaining(['beano', 'beani', 'beanz']));
    const again = play(s, { type: 'finishDialogue', dialogue: 'dlg.beano.danke' });
    expect(again.state).toBe(s);
  });
});

describe('Fuchsbau: Ein Kranz für Bean', () => {
  const toWald = (s: GameState) => {
    let t = travel(s, HOTPOT, { x: 7, y: 29 }, 'exit.zum-zoo');
    t = travel(t, ZOO, { x: 7, y: 0 }, 'exit.zum-ufer');
    t = travel(t, MAP, { x: 1, y: 27 }, 'exit.zum-bach');
    return travel(t, BACH, { x: 11, y: 0 }, 'exit.zum-wald');
  };

  it('nach dem Festessen wartet Bean im Wald', () => {
    const s = hotpotDone();
    expect(questLog(s, content).offers.map((q) => q.id)).toContain('quest.bean.kranz');
    expect(selectDialogue('bean', s, content)?.id).toBe('dlg.bean.hallo');
    expect(selectDialogue('bean', fresh(), content)?.id).toBe('dlg.bean.fremd');
  });

  it('drei Tannenzapfen und eine Beere, Kranz basteln, abgeben: Moment und zwei Rezepte genau einmal', () => {
    let s = toWald(hotpotDone());
    s = play(
      s,
      { type: 'finishDialogue', dialogue: 'dlg.bean.hallo' },
      { type: 'gather', map: WALD, spot: 'spot.zapfen.links', at: late },
      { type: 'gather', map: WALD, spot: 'spot.zapfen.rechts', at: late },
      { type: 'gather', map: WALD, spot: 'spot.zapfen.mitte', at: late },
      { type: 'gather', map: WALD, spot: 'spot.beere.oben', at: late },
      { type: 'craft', recipe: 'recipe.zapfenkranz' },
    ).state;
    expect(s.quests['quest.bean.kranz']?.step).toBe('bringen');
    const r = play(s, { type: 'finishDialogue', dialogue: 'dlg.bean.danke' }, { type: 'finishDialogue', dialogue: 'dlg.bean.danke' });
    expect(r.state.quests['quest.bean.kranz']?.done).toBe(true);
    expect(r.state.moments.filter((m) => m === 'moment.bean.kranz')).toHaveLength(1);
    expect(r.state.recipesKnown).toEqual(expect.arrayContaining(['recipe.beerenlicht', 'recipe.mooskissen']));
    expect(friendList(r.state, content)).toContain('bean');
  });
});

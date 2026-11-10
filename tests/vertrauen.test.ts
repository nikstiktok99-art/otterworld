// Vertrauens-Aufgaben: Nach der Herzensbitte ist ein Freund spielbar.
import { describe, expect, it } from 'vitest';
import { content, MAP, play, rejected, T0 } from './helpers';
import { BACH, BAY, bachDone, CAFE, cafeDone, HOTPOT, hotpotDone, travel, WALD, ZOO, zooDone } from './progress';
import type { Action } from '../src/game/actions';
import type { GameState } from '../src/game/types';
import { matches } from '../src/game/conditions';
import { resolveAllNpcs } from '../src/game/occupancy';
import { gridFor, terrainAt } from '../src/game/space';
import { hasNews, selectDialogue } from '../src/game/text';

const MIN = 60_000;
let clock = T0 + 2000 * MIN;
/** Jede Sammelaktion ein Stück später – so ist alles Nachwachsende wieder da. */
const g = (map: string, spot: string): Action => {
  clock += 30 * MIN;
  return { type: 'gather', map, spot, at: clock };
};
const fly = (s: GameState, map: string) => play(s, { type: 'fastTravel', map }).state;
const talk = (s: GameState, dialogue: string) => play(s, { type: 'finishDialogue', dialogue }).state;

/** Gemeinsame Prüfung am Ende jeder Bitte. */
function expectTrust(s: GameState, quest: string, characters: string[], moments: string[]) {
  expect(s.quests[quest]?.done).toBe(true);
  for (const c of characters) expect(s.unlocked).toContain(c);
  for (const m of moments) expect(s.moments.filter((x) => x === m)).toHaveLength(1);
}

describe('Rosie und Bubbles: Ein Licht für den Teich', () => {
  function done(): GameState {
    let s = bachDone();
    expect(hasNews('rosie', s, content)).toBe(true);
    s = play(s, g(MAP, 'spot.muschel.sand')).state;
    s = fly(s, BACH);
    s = talk(s, 'dlg.rosie.teichlicht');
    expect(s.recipesKnown).toContain('recipe.teichlaterne');
    s = play(
      s,
      g(BACH, 'spot.kiesel.links'),
      g(BACH, 'spot.kiesel.rechts'),
      { type: 'craft', recipe: 'recipe.kiesellicht' },
      g(BACH, 'spot.seerose.links'),
      g(BACH, 'spot.seerose.rechts'),
      { type: 'craft', recipe: 'recipe.teichlaterne' },
    ).state;
    expect(s.quests['quest.rosie.teichlicht']?.step).toBe('bringen');
    expect(selectDialogue('rosie', s, content)?.id).toBe('dlg.rosie.teichlicht.danke');
    return talk(talk(s, 'dlg.rosie.teichlicht.danke'), 'dlg.rosie.teichlicht.danke');
  }

  it('Teichlaterne basteln und bringen: beide spielbar, zwei Momente genau einmal', () => {
    expectTrust(done(), 'quest.rosie.teichlicht', ['rosie', 'bubbles'], ['moment.rosie.teichlicht', 'moment.bubbles.teichlicht']);
  });

  it('als Rosie im Teich: nur im Wasser; im Café ohne Wasser geht der Wechsel nicht', () => {
    const s = done();
    const asRosie = play(s, { type: 'switchCharacter', character: 'rosie' }).state;
    expect(asRosie.activeCharacter).toBe('rosie');
    expect(terrainAt(gridFor(content.maps[BACH]!), asRosie.location.tile)).toBe('water');
    const asBubbles = play(asRosie, { type: 'switchCharacter', character: 'bubbles' }).state;
    expect(asBubbles.activeCharacter).toBe('bubbles');
    // Ins Café (zum Test als besucht markiert) – als Otter hin, dann wechseln
    const inCafe = fly({ ...s, visited: [...s.visited, CAFE] }, CAFE);
    const r = play(inCafe, { type: 'switchCharacter', character: 'rosie' });
    expect(rejected(r.events)[0]).toMatchObject({ reason: 'invalidPosition' });
    expect(r.state.activeCharacter).toBe('otter');
  });
});

describe('Meerkat: Eine Sonnenblume für Meerkat', () => {
  it('Sonnenblumentopf bringen: Meerkat spielbar, Stein zeigt die Sonnenblume', () => {
    let s = zooDone();
    expect(selectDialogue('meerkat', s, content)?.id).toBe('dlg.meerkat.sonnenblume');
    s = talk(s, 'dlg.meerkat.sonnenblume');
    s = travel(s, ZOO, { x: 7, y: 0 }, 'exit.zum-ufer');
    s = play(s, g(MAP, 'spot.muschel.sand'), { type: 'craft', recipe: 'recipe.sonnenblumentopf' }).state;
    expect(s.quests['quest.meerkat.sonnenblume']?.step).toBe('bringen');
    s = talk(fly(s, ZOO), 'dlg.meerkat.sonnenblume.danke');
    expectTrust(s, 'quest.meerkat.sonnenblume', ['meerkat'], ['moment.meerkat.sonnenblume']);
    const stone = content.maps[ZOO]!.objects.find((o) => o.id === 'obj.aussichtsstein')!;
    expect(stone.variants?.find((v) => matches(v.when, s))?.sprite).toBe('objects.aussichtsstein.blume');
    // Als Meerkat: nur an Land; Meerkat steht nicht zusätzlich im Gehege
    const asMeerkat = play(s, { type: 'switchCharacter', character: 'meerkat' }).state;
    expect(resolveAllNpcs(asMeerkat, content).map((n) => n.body)).not.toContain('body.meerkat');
  });
});

describe('Squichy: Ein Nickerchen für Squichy', () => {
  it('nach dem Ball: Seerosenkissen bringen, Squichy spielbar', () => {
    let s = talk(zooDone(), 'dlg.squichy.hallo');
    s = travel(s, ZOO, { x: 7, y: 0 }, 'exit.zum-ufer');
    s = travel(s, MAP, { x: 14, y: 21 }, 'exit.zur-bucht');
    s = play(s, g(BAY, 'spot.schilf.links'), g(BAY, 'spot.schilf.rechts'), { type: 'craft', recipe: 'recipe.schilfball' }).state;
    s = talk(fly(s, ZOO), 'dlg.squichy.danke');
    expect(s.quests['quest.squichy.ball']?.done).toBe(true);
    expect(hasNews('squichy', s, content)).toBe(true);
    s = talk(s, 'dlg.squichy.nickerchen');
    s = fly(s, BACH);
    s = play(s, g(BACH, 'spot.seerose.links'), g(BACH, 'spot.seerose.rechts'), g(BACH, 'spot.bluete.wiese'), { type: 'craft', recipe: 'recipe.seerosenkissen' }).state;
    s = talk(fly(s, ZOO), 'dlg.squichy.nickerchen.danke');
    expectTrust(s, 'quest.squichy.nickerchen', ['squichy'], ['moment.squichy.nickerchen']);
  });
});

describe('Chamaron: Farben für Chamaron', () => {
  it('Blütengirlande bringen: Chamaron spielbar', () => {
    let s = cafeDone();
    expect(selectDialogue('chamaron', s, content)?.id).toBe('dlg.chamaron.farben');
    s = talk(s, 'dlg.chamaron.farben');
    s = fly(s, BACH);
    s = play(
      s,
      g(BACH, 'spot.bluete.wiese'),
      g(BACH, 'spot.bluete.links'),
      g(BACH, 'spot.bluete.rechts'),
      g(BACH, 'spot.kiesel.rechts'),
      { type: 'craft', recipe: 'recipe.bluetengirlande' },
    ).state;
    s = talk(fly(s, CAFE), 'dlg.chamaron.farben.danke');
    expectTrust(s, 'quest.chamaron.farben', ['chamaron'], ['moment.chamaron.farben']);
  });
});

describe('Beano, Beani und Beanz: Suppe für alle', () => {
  it('Kräutersuppe vom Kochtopf: alle drei spielbar, drei Momente, eine Schale', () => {
    let s = hotpotDone();
    s = talk(s, 'dlg.beano.suppe');
    s = play(s, g(HOTPOT, 'spot.kraeuter'), g(HOTPOT, 'spot.gemuese.mitte')).state;
    s = fly(s, MAP);
    s = play(s, g(MAP, 'spot.muschel.sand')).state;
    s = fly(s, HOTPOT);
    s = play(s, { type: 'craft', recipe: 'recipe.kraeutersuppe', station: 'kochtopf' }).state;
    s = talk(s, 'dlg.beano.suppe.danke');
    expectTrust(s, 'quest.erbsen.suppe', ['beano', 'beani', 'beanz'], ['moment.beano.suppe', 'moment.beani.suppe', 'moment.beanz.suppe']);
    const asBeani = play(s, { type: 'switchCharacter', character: 'beani' }).state;
    expect(resolveAllNpcs(asBeani, content).some((n) => n.body === 'body.erbsenschale')).toBe(false);
    const r = play(asBeani, { type: 'switchCharacter', character: 'beanz' });
    expect(r.events).toContainEqual({ type: 'switched', character: 'beanz', body: 'body.erbsenschale', bodyChanged: false });
  });
});

describe('Bean: Ein Licht im Wald', () => {
  it('nach dem Kranz: Beerenlicht bringen, Bean spielbar', () => {
    let s = travel(hotpotDone(), HOTPOT, { x: 7, y: 29 }, 'exit.zum-zoo');
    s = fly(s, BACH);
    s = travel(s, BACH, { x: 11, y: 0 }, 'exit.zum-wald');
    s = talk(s, 'dlg.bean.hallo');
    s = play(
      s,
      g(WALD, 'spot.zapfen.links'),
      g(WALD, 'spot.zapfen.rechts'),
      g(WALD, 'spot.zapfen.mitte'),
      g(WALD, 'spot.beere.oben'),
      { type: 'craft', recipe: 'recipe.zapfenkranz' },
    ).state;
    s = talk(s, 'dlg.bean.danke');
    expect(s.quests['quest.bean.kranz']?.done).toBe(true);
    s = talk(s, 'dlg.bean.waldlicht');
    s = play(s, g(WALD, 'spot.beere.oben'), g(WALD, 'spot.beere.links'), { type: 'craft', recipe: 'recipe.beerenlicht' }).state;
    expect(s.quests['quest.bean.waldlicht']?.step).toBe('bringen');
    s = talk(s, 'dlg.bean.waldlicht.danke');
    expectTrust(s, 'quest.bean.waldlicht', ['bean'], ['moment.bean.waldlicht']);
  });
});

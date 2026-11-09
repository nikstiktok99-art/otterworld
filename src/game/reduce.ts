// Die einzige Stelle, an der sich der Spielstand ändert.
// (Zustand, Aktion, Inhalt) -> (neuer Zustand, Ereignisse). Abgelehnte Aktionen ändern nichts.
import { DEFAULT_STATION, type Content, type Effect, type Trigger } from '../content/types';
import { spotKey, spotReady } from './rules/spots';
import type { Action, GameEvent, RejectReason } from './actions';
import type { GameState, Tile } from './types';
import { sameTile } from './types';
import { matches } from './conditions';
import { checkPlacement } from './rules/placement';
import { cleanName } from './rules/name';
import { count } from './state';
import { movementBlocked } from './occupancy';
import { gridFor, key, nearestStandable, standable, terrainAt } from './space';

export interface ReduceResult {
  state: GameState;
  events: GameEvent[];
  changed: boolean;
}

class Draft {
  s: GameState;
  events: GameEvent[] = [];
  changed = false;
  constructor(readonly original: GameState) {
    // Der Spielstand ist reines JSON – eine tiefe Kopie ist billig und sicher.
    this.s = JSON.parse(JSON.stringify(original)) as GameState;
  }
  emit(e: GameEvent) {
    this.events.push(e);
  }
  touch() {
    this.changed = true;
  }
}

export function reduce(state: GameState, action: Action, content: Content): ReduceResult {
  const d = new Draft(state);
  const reject = (reason: RejectReason, detail?: string): ReduceResult => ({
    state,
    events: [{ type: 'rejected', action: action.type, reason, ...(detail ? { detail } : {}) }],
    changed: false,
  });
  const s = d.s;

  switch (action.type) {
    case 'gather': {
      const map = content.maps[action.map];
      const spot = map?.gatherSpots.find((sp) => sp.id === action.spot);
      if (!map || !spot) return reject('unknown');
      const k = spotKey(map.id, spot.id);
      if (!spot.regrowMinutes && s.gathered.includes(k)) return reject('alreadyGathered');
      if (!matches(spot.availableWhen, state)) return reject('notYet');
      if (!spotReady(state, map, spot, action.at)) return reject('alreadyGathered');
      if (spot.regrowMinutes) s.regrow[k] = action.at + spot.regrowMinutes * 60_000;
      else s.gathered.push(k);
      s.inventory[spot.item] = count(s, spot.item) + spot.count;
      d.touch();
      d.emit({ type: 'itemGained', item: spot.item, count: spot.count, total: count(s, spot.item) });
      break;
    }

    case 'craft': {
      const recipe = content.recipes[action.recipe];
      if (!recipe) return reject('unknown');
      if (!s.recipesKnown.includes(recipe.id)) return reject('recipeUnknown');
      if ((recipe.station ?? DEFAULT_STATION) !== (action.station ?? DEFAULT_STATION)) return reject('wrongStation');
      for (const [item, n] of Object.entries(recipe.inputs)) {
        if (count(s, item) < n) return reject('missingItems');
      }
      // Verbrauch und Ergebnis in einem Schritt – sie landen immer im selben Spielstand.
      for (const [item, n] of Object.entries(recipe.inputs)) {
        s.inventory[item] = count(s, item) - n;
        if (s.inventory[item] === 0) delete s.inventory[item];
      }
      s.inventory[recipe.output.item] = count(s, recipe.output.item) + recipe.output.count;
      d.touch();
      d.emit({ type: 'itemsUsed', items: { ...recipe.inputs } });
      d.emit({ type: 'crafted', recipe: recipe.id, item: recipe.output.item });
      d.emit({
        type: 'itemGained',
        item: recipe.output.item,
        count: recipe.output.count,
        total: count(s, recipe.output.item),
      });
      break;
    }

    case 'placeDeco': {
      const item = content.items[action.item];
      if (!item || item.kind !== 'deco') return reject('unknown');
      if (count(s, item.id) < 1) return reject('notInInventory');
      const problem = checkPlacement(state, content, action.map, action.tile);
      if (problem) return reject(problem.reason, problem.detail);
      s.inventory[item.id] = count(s, item.id) - 1;
      if (s.inventory[item.id] === 0) delete s.inventory[item.id];
      const uid = `deco-${s.nextDecoId}`;
      s.nextDecoId += 1;
      s.deco.push({ uid, item: item.id, map: action.map, tile: { ...action.tile }, on: false });
      d.touch();
      d.emit({ type: 'placed', uid, item: item.id, tile: { ...action.tile } });
      break;
    }

    case 'moveDeco': {
      const deco = s.deco.find((x) => x.uid === action.uid);
      if (!deco) return reject('unknown');
      const problem = checkPlacement(state, content, deco.map, action.tile, deco.uid);
      if (problem) return reject(problem.reason, problem.detail);
      deco.tile = { ...action.tile };
      d.touch();
      d.emit({ type: 'moved', uid: deco.uid, tile: { ...action.tile } });
      break;
    }

    case 'pickUpDeco': {
      // Wieder einpacken: zurück in den Beutel. Wer daneben saß, sucht sich seinen nächsten Platz.
      const idx = s.deco.findIndex((x) => x.uid === action.uid);
      const deco = s.deco[idx];
      if (!deco) return reject('unknown');
      s.deco.splice(idx, 1);
      s.inventory[deco.item] = count(s, deco.item) + 1;
      d.touch();
      d.emit({ type: 'pickedUp', uid: deco.uid, item: deco.item });
      break;
    }

    case 'trackQuest': {
      if (action.quest !== null) {
        const prog = s.quests[action.quest];
        if (!content.quests[action.quest] || !prog || prog.done) return reject('unknown');
      }
      if (s.tracked !== action.quest) {
        s.tracked = action.quest;
        d.touch();
      }
      break;
    }

    case 'toggleDeco': {
      const deco = s.deco.find((x) => x.uid === action.uid);
      const item = deco ? content.items[deco.item] : undefined;
      if (!deco || !item?.deco) return reject('unknown');
      if (!matches(item.deco.toggleWhen, state)) return reject('notYet', item.deco.toggleNotYetText);
      deco.on = !deco.on;
      d.touch();
      d.emit({ type: 'toggled', uid: deco.uid, on: deco.on });
      break;
    }

    case 'finishDialogue': {
      const dlg = content.dialogues.find((x) => x.id === action.dialogue);
      if (!dlg) return reject('unknown');
      const claim = `dlg:${dlg.id}`;
      const pending = !!dlg.effects?.length && !s.claimed.includes(claim);
      // Abgeben geht nur ganz oder gar nicht: fehlt etwas, bleibt alles, wie es war.
      if (pending) {
        for (const e of dlg.effects!) {
          if ('takeItems' in e && Object.entries(e.takeItems).some(([item, n]) => count(s, item) < n)) return reject('missingItems');
        }
      }
      d.emit({ type: 'dialogueFinished', dialogue: dlg.id });
      if (pending) {
        s.claimed.push(claim);
        d.touch();
        applyEffects(d, dlg.effects!, content);
      }
      break;
    }

    case 'setPlayerName': {
      const name = cleanName(action.name);
      if (!name) return reject('invalidName');
      if (s.player.name !== name) {
        s.player.name = name;
        d.touch();
      }
      d.emit({ type: 'nameSet', name });
      break;
    }

    case 'arrive': {
      // Nur die Position auf der aktuellen Map melden – den Ort wechseln nur 'travel' und nichts sonst.
      const map = content.maps[action.map];
      const body = content.bodies[content.characters[s.activeCharacter]?.body ?? ''];
      if (!map || !body || map.id !== s.location.map || !standable(terrainAt(gridFor(map), action.tile), body.moves)) {
        return reject('invalidPosition');
      }
      const l = s.location;
      if (l.map !== action.map || l.tile.x !== action.tile.x || l.tile.y !== action.tile.y || l.facing !== action.facing) {
        s.location = { map: action.map, tile: { ...action.tile }, facing: action.facing };
        d.touch();
      }
      break;
    }

    case 'travel': {
      // Ortswechsel: nur von einer Ausgangskachel aus; die Figur landet sicher am Ankunftspunkt des Ziels.
      const map = content.maps[s.location.map];
      const exit = map?.exits.find((e) => e.id === action.exit);
      if (!map || !exit) return reject('unknown');
      if (!exit.tiles.some((t) => sameTile(t, s.location.tile))) return reject('invalidPosition');
      const target = content.maps[exit.to.map];
      const entry = target?.entries.find((e) => e.id === exit.to.entry);
      const body = content.bodies[content.characters[s.activeCharacter]?.body ?? ''];
      if (!target || !entry || !body) return reject('unknown');
      const tile = safeTile(s, content, target.id, entry.tile, body.moves);
      if (!tile) return reject('invalidPosition');
      s.location = { map: target.id, tile, facing: entry.facing };
      if (!s.visited.includes(target.id)) s.visited.push(target.id);
      d.touch();
      d.emit({ type: 'traveled', exit: exit.id, from: map.id, to: target.id });
      break;
    }

    case 'fastTravel': {
      // Wegkarte: nur zu Orten, die sie schon kennt; Ankunft am sicheren Platz des Ortes.
      const target = content.maps[action.map];
      const body = content.bodies[content.characters[s.activeCharacter]?.body ?? ''];
      if (!target || !body) return reject('unknown');
      if (!s.visited.includes(target.id)) return reject('locked');
      if (s.location.map === target.id) return reject('alreadyHere');
      const tile = safeTile(s, content, target.id, target.arrival, body.moves);
      if (!tile) return reject('invalidPosition');
      const from = s.location.map;
      s.location = { map: target.id, tile, facing: 'se' };
      d.touch();
      d.emit({ type: 'traveled', exit: null, from, to: target.id });
      break;
    }

    case 'switchCharacter': {
      const ch = content.characters[action.character];
      const body = ch ? content.bodies[ch.body] : undefined;
      if (!ch || !body) return reject('unknown');
      if (!s.unlocked.includes(ch.id)) return reject('locked');
      if (s.activeCharacter === ch.id) break;
      const before = content.characters[s.activeCharacter]?.body;
      const bodyChanged = before !== ch.body;
      // Derselbe Körper (z. B. eine andere Erbse in der Schale): Position bleibt, nur wer spricht, ändert sich.
      if (bodyChanged) {
        const tile = safeTile(s, content, s.location.map, s.location.tile, body.moves);
        if (!tile) return reject('invalidPosition');
        s.location = { ...s.location, tile };
      }
      s.activeCharacter = ch.id;
      d.touch();
      d.emit({ type: 'switched', character: ch.id, body: ch.body, bodyChanged });
      break;
    }

    case 'setSetting': {
      if (s.settings[action.key] !== action.value) {
        s.settings[action.key] = action.value;
        d.touch();
      }
      break;
    }
  }

  progressQuests(d, content);
  return { state: d.changed ? d.s : state, events: d.events, changed: d.changed };
}

function applyEffects(d: Draft, effects: Effect[], content: Content) {
  const s = d.s;
  for (const e of effects) {
    if ('startQuest' in e) {
      const q = content.quests[e.startQuest];
      const first = q?.steps[0];
      if (q && first && !s.quests[q.id]) {
        s.quests[q.id] = { step: first.id, done: false };
        // Eine gerade angenommene Aufgabe steht oben im Hinweis.
        s.tracked = q.id;
        d.touch();
        d.emit({ type: 'questStarted', quest: q.id });
      }
    } else if ('learnRecipe' in e) {
      if (content.recipes[e.learnRecipe] && !s.recipesKnown.includes(e.learnRecipe)) {
        s.recipesKnown.push(e.learnRecipe);
        d.touch();
        d.emit({ type: 'recipeLearned', recipe: e.learnRecipe });
      }
    } else if ('addMoment' in e) {
      if (!s.moments.includes(e.addMoment)) {
        s.moments.push(e.addMoment);
        d.touch();
        d.emit({ type: 'momentGained', moment: e.addMoment });
      }
    } else if ('setDecoOn' in e) {
      for (const deco of s.deco) {
        if (deco.item === e.setDecoOn.item && deco.on !== e.setDecoOn.on) {
          deco.on = e.setDecoOn.on;
          d.touch();
          d.emit({ type: 'toggled', uid: deco.uid, on: deco.on });
        }
      }
    } else if ('giveItems' in e) {
      for (const [item, n] of Object.entries(e.giveItems)) {
        if (!content.items[item] || n <= 0) continue;
        s.inventory[item] = count(s, item) + n;
        d.touch();
        d.emit({ type: 'itemGained', item, count: n, total: count(s, item) });
      }
    } else if ('takeItems' in e) {
      // Vorab geprüft (finishDialogue): hier ist genug da.
      const used: Record<string, number> = {};
      for (const [item, n] of Object.entries(e.takeItems)) {
        const take = Math.min(n, count(s, item));
        if (take <= 0) continue;
        s.inventory[item] = count(s, item) - take;
        if (s.inventory[item] === 0) delete s.inventory[item];
        used[item] = take;
      }
      if (Object.keys(used).length) {
        d.touch();
        d.emit({ type: 'itemsUsed', items: used });
      }
    } else if ('unlockCharacter' in e) {
      if (content.characters[e.unlockCharacter] && !s.unlocked.includes(e.unlockCharacter)) {
        s.unlocked.push(e.unlockCharacter);
        d.touch();
        d.emit({ type: 'unlocked', character: e.unlockCharacter });
      }
    }
  }
}

/** Sichere Kachel für eine Figur auf einer Map: die gewünschte, sonst die nächste freie, auf der sie stehen kann. */
function safeTile(s: GameState, content: Content, mapId: string, wanted: Tile, moves: readonly ('land' | 'water')[]): Tile | null {
  const map = content.maps[mapId];
  if (!map) return null;
  const g = gridFor(map);
  const blocked = movementBlocked(s, map);
  const t = nearestStandable(g, blocked, wanted, moves) ?? nearestStandable(g, blocked, map.arrival, moves);
  return t && !blocked.has(key(g, t)) ? { x: t.x, y: t.y } : null;
}

function triggerMet(t: Trigger, d: Draft): boolean {
  if ('hasItems' in t) return Object.entries(t.hasItems).every(([item, n]) => count(d.s, item) >= n);
  if ('crafted' in t) return d.events.some((e) => e.type === 'crafted' && e.recipe === t.crafted);
  if ('placed' in t) return d.events.some((e) => e.type === 'placed' && e.item === t.placed);
  if ('dialogue' in t) return d.events.some((e) => e.type === 'dialogueFinished' && e.dialogue === t.dialogue);
  if ('atMap' in t) return d.s.location.map === t.atMap;
  return false;
}

/** Questschritte weiterschalten. Belohnungen eines Schritts werden über `claimed` genau einmal vergeben. */
function progressQuests(d: Draft, content: Content) {
  for (let guard = 0; guard < 20; guard++) {
    let advanced = false;
    for (const [qid, prog] of Object.entries(d.s.quests)) {
      if (prog.done) continue;
      const quest = content.quests[qid];
      const idx = quest?.steps.findIndex((st) => st.id === prog.step) ?? -1;
      const step = quest?.steps[idx];
      if (!quest || !step || !triggerMet(step.completeWhen, d)) continue;
      const claim = `quest:${qid}:${step.id}`;
      if (!d.s.claimed.includes(claim)) {
        d.s.claimed.push(claim);
        if (step.onComplete) applyEffects(d, step.onComplete, content);
      }
      const next = quest.steps[idx + 1];
      if (next) {
        prog.step = next.id;
        d.emit({ type: 'questStep', quest: qid, step: next.id });
      } else {
        prog.done = true;
        if (d.s.tracked === qid) d.s.tracked = null;
        d.emit({ type: 'questDone', quest: qid });
      }
      d.touch();
      advanced = true;
    }
    if (!advanced) return;
  }
}

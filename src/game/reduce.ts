// Die einzige Stelle, an der sich der Spielstand ändert.
// (Zustand, Aktion, Inhalt) -> (neuer Zustand, Ereignisse). Abgelehnte Aktionen ändern nichts.
import type { Content, Effect, Trigger } from '../content/types';
import type { Action, GameEvent, RejectReason } from './actions';
import type { GameState } from './types';
import { matches } from './conditions';
import { checkPlacement } from './rules/placement';
import { cleanName } from './rules/name';
import { count } from './state';
import { gridFor, standable, terrainAt } from './space';

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
      const k = `${map.id}/${spot.id}`;
      if (s.gathered.includes(k)) return reject('alreadyGathered');
      s.gathered.push(k);
      s.inventory[spot.item] = count(s, spot.item) + spot.count;
      d.touch();
      d.emit({ type: 'itemGained', item: spot.item, count: spot.count, total: count(s, spot.item) });
      break;
    }

    case 'craft': {
      const recipe = content.recipes[action.recipe];
      if (!recipe) return reject('unknown');
      if (!s.recipesKnown.includes(recipe.id)) return reject('recipeUnknown');
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
      d.emit({ type: 'dialogueFinished', dialogue: dlg.id });
      const claim = `dlg:${dlg.id}`;
      if (dlg.effects?.length && !s.claimed.includes(claim)) {
        s.claimed.push(claim);
        d.touch();
        applyEffects(d, dlg.effects, content);
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
      const map = content.maps[action.map];
      const body = content.bodies[content.characters[s.activeCharacter]?.body ?? ''];
      if (!map || !body || !standable(terrainAt(gridFor(map), action.tile), body.moves)) {
        return reject('invalidPosition');
      }
      const l = s.location;
      if (l.map !== action.map || l.tile.x !== action.tile.x || l.tile.y !== action.tile.y || l.facing !== action.facing) {
        s.location = { map: action.map, tile: { ...action.tile }, facing: action.facing };
        d.touch();
      }
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
    }
  }
}

function triggerMet(t: Trigger, d: Draft): boolean {
  if ('hasItems' in t) return Object.entries(t.hasItems).every(([item, n]) => count(d.s, item) >= n);
  if ('crafted' in t) return d.events.some((e) => e.type === 'crafted' && e.recipe === t.crafted);
  if ('placed' in t) return d.events.some((e) => e.type === 'placed' && e.item === t.placed);
  if ('dialogue' in t) return d.events.some((e) => e.type === 'dialogueFinished' && e.dialogue === t.dialogue);
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
        d.emit({ type: 'questDone', quest: qid });
      }
      d.touch();
      advanced = true;
    }
    if (!advanced) return;
  }
}

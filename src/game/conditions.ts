import type { Condition } from '../content/types';
import type { GameState } from './types';

export function matches(cond: Condition | undefined, s: GameState): boolean {
  if (!cond) return true;
  if ('all' in cond) return cond.all.every((c) => matches(c, s));
  if ('any' in cond) return cond.any.some((c) => matches(c, s));
  if ('not' in cond) return !matches(cond.not, s);
  if ('hasName' in cond) return (s.player.name !== null) === cond.hasName;
  if ('questNotStarted' in cond) return !s.quests[cond.questNotStarted];
  if ('questStep' in cond) {
    const q = s.quests[cond.questStep.quest];
    return !!q && !q.done && q.step === cond.questStep.step;
  }
  if ('questDone' in cond) return !!s.quests[cond.questDone]?.done;
  if ('hasMoment' in cond) return s.moments.includes(cond.hasMoment);
  if ('hasItems' in cond) return Object.entries(cond.hasItems).every(([item, n]) => (s.inventory[item] ?? 0) >= n);
  return false;
}

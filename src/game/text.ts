// Lesende Helfer für Texte: Namen, Platzhalter, Dialogauswahl, Questhinweis.
import type { Content, DialogueDef } from '../content/types';
import type { GameState } from './types';
import { matches } from './conditions';
import { count } from './state';

export function characterName(id: string | null, s: GameState, content: Content): string {
  if (!id) return '';
  const c = content.characters[id];
  if (!c) return id;
  if (typeof c.name === 'string') return c.name;
  return s.player.name ?? c.name.fallback;
}

/** Ersetzt {name} und {count:item.id}. */
export function fillText(text: string, s: GameState): string {
  return text
    .replace(/\{name\}/g, s.player.name ?? 'du')
    .replace(/\{count:([^}]+)\}/g, (_, item: string) => String(count(s, item)));
}

/** Der Dialog, den diese Figur gerade führen würde (erster passender). */
export function selectDialogue(character: string, s: GameState, content: Content): DialogueDef | null {
  return content.dialogues.find((d) => d.character === character && matches(d.when, s)) ?? null;
}

/** Hinweis für die Anzeige oben: der aktuelle Schritt der ersten offenen Quest, sonst eine anstehende Quest. */
export function activeHint(s: GameState, content: Content): string | null {
  for (const [qid, prog] of Object.entries(s.quests)) {
    if (prog.done) continue;
    const step = content.quests[qid]?.steps.find((st) => st.id === prog.step);
    if (step) return fillText(step.hint, s);
  }
  for (const q of Object.values(content.quests)) {
    if (!s.quests[q.id] && q.offer && matches(q.offer.when, s)) return fillText(q.offer.hint, s);
  }
  return null;
}

/** Figuren im Freundebuch: die Startfigur zuerst, dann alle, die man schon kennt. */
export function friendList(s: GameState, content: Content): string[] {
  const met = Object.values(content.characters)
    .filter((c) => c.id !== content.start.character && c.friend && matches(c.friend.metWhen, s))
    .map((c) => c.id);
  return [content.start.character, ...met];
}

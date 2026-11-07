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

/** Hinweis für die Anzeige oben: der aktuelle Schritt der ersten offenen Quest. */
export function activeHint(s: GameState, content: Content): string | null {
  for (const [qid, prog] of Object.entries(s.quests)) {
    if (prog.done) continue;
    const step = content.quests[qid]?.steps.find((st) => st.id === prog.step);
    if (step) return fillText(step.hint, s);
  }
  return null;
}

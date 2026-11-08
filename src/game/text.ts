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

function currentStepHint(qid: string, s: GameState, content: Content): string | null {
  const prog = s.quests[qid];
  if (!prog || prog.done) return null;
  const step = content.quests[qid]?.steps.find((st) => st.id === prog.step);
  return step ? fillText(step.hint, s) : null;
}

/** Anstehende Aufgaben, die noch nicht begonnen haben (jemand hat eine Idee). */
function offers(s: GameState, content: Content) {
  return Object.values(content.quests).filter((q) => !s.quests[q.id] && q.offer && matches(q.offer.when, s));
}

/**
 * Hinweis für die Anzeige oben: die verfolgte Aufgabe, sonst die zuerst begonnene offene,
 * sonst eine anstehende Aufgabe.
 */
export function activeHint(s: GameState, content: Content): string | null {
  const qid = shownQuest(s, content);
  if (qid) return currentStepHint(qid, s, content);
  const offer = offers(s, content)[0];
  return offer?.offer ? fillText(offer.offer.hint, s) : null;
}

/** Welche offene Aufgabe oben angezeigt wird. */
function shownQuest(s: GameState, content: Content): string | null {
  if (s.tracked && currentStepHint(s.tracked, s, content)) return s.tracked;
  return Object.keys(s.quests).find((qid) => currentStepHint(qid, s, content) !== null) ?? null;
}

export interface QuestLogEntry {
  id: string;
  name: string;
  giver: string | null;
  /** Aktueller Hinweis (offene Aufgaben) oder Titel der Abschlusskarte (erledigte). */
  text: string | null;
  tracked: boolean;
  step: number;
  steps: number;
}

/** Das Aufgabenbuch: offene, anstehende und erledigte Aufgaben. */
export function questLog(s: GameState, content: Content): { active: QuestLogEntry[]; offers: QuestLogEntry[]; done: QuestLogEntry[] } {
  const active: QuestLogEntry[] = [];
  const done: QuestLogEntry[] = [];
  const shown = shownQuest(s, content);
  for (const [qid, prog] of Object.entries(s.quests)) {
    const q = content.quests[qid];
    if (!q) continue;
    const idx = q.steps.findIndex((st) => st.id === prog.step);
    const entry: QuestLogEntry = {
      id: qid,
      name: q.name,
      giver: q.giver ?? null,
      text: prog.done ? (q.ending?.title ?? null) : currentStepHint(qid, s, content),
      tracked: false,
      step: prog.done ? q.steps.length : Math.max(0, idx),
      steps: q.steps.length,
    };
    if (prog.done) done.push(entry);
    else active.push({ ...entry, tracked: qid === shown });
  }
  const pending = offers(s, content).map((q) => ({
    id: q.id,
    name: q.name,
    giver: q.giver ?? null,
    text: q.offer ? fillText(q.offer.hint, s) : null,
    tracked: false,
    step: 0,
    steps: q.steps.length,
  }));
  return { active, offers: pending, done };
}

/**
 * Hat diese Figur gerade etwas Neues für sie (Aufgabe, Geschenk, nächster Schritt)?
 * Dann zeigt die Welt eine kleine Sprechblase über ihr.
 */
export function hasNews(character: string, s: GameState, content: Content): boolean {
  const dlg = selectDialogue(character, s, content);
  if (!dlg) return false;
  if (dlg.effects?.length && !s.claimed.includes(`dlg:${dlg.id}`)) return true;
  return Object.entries(s.quests).some(([qid, prog]) => {
    if (prog.done) return false;
    const step = content.quests[qid]?.steps.find((st) => st.id === prog.step);
    return !!step && 'dialogue' in step.completeWhen && step.completeWhen.dialogue === dlg.id;
  });
}

/** Figuren im Freundebuch: die Startfigur zuerst, dann alle, die man schon kennt. */
export function friendList(s: GameState, content: Content): string[] {
  const met = Object.values(content.characters)
    .filter((c) => c.id !== content.start.character && c.friend && matches(c.friend.metWhen, s))
    .map((c) => c.id);
  return [content.start.character, ...met];
}

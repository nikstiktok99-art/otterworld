// Lesende Helfer für Texte: Namen, Platzhalter, Dialogauswahl, Questhinweis.
import type { Content, DialogueDef } from '../content/types';
import type { GameState } from './types';
import { matches } from './conditions';
import { count } from './state';
import { resolveAllNpcs } from './occupancy';

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

export interface KartenOrt {
  id: string;
  name: string;
  x: number;
  y: number;
  /** Schon betreten: man kann hinreisen. Sonst nur als Nachbar bekannt (blass, „Unbekannter Ort“). */
  besucht: boolean;
  hier: boolean;
  /** Dort hat jemand etwas Neues (Aufgabe, nächster Schritt, Geschenk). */
  neuigkeit: boolean;
}

/** Die Wegkarte: besuchte Orte, ihre direkten Nachbarn und die Wege dazwischen. */
export function wegkarte(s: GameState, content: Content): { orte: KartenOrt[]; wege: Array<[string, string]> } {
  const besucht = new Set(s.visited);
  const bekannt = new Set(s.visited);
  for (const id of s.visited) for (const ex of content.maps[id]?.exits ?? []) bekannt.add(ex.to.map);
  const neu = new Set(
    resolveAllNpcs(s, content)
      .filter((n) => n.characters.some((c) => hasNews(c, s, content)))
      .map((n) => n.map),
  );
  const orte: KartenOrt[] = [];
  for (const id of bekannt) {
    const m = content.maps[id];
    if (!m?.overview) continue;
    orte.push({
      id,
      name: m.name,
      x: m.overview.x,
      y: m.overview.y,
      besucht: besucht.has(id),
      hier: s.location.map === id,
      neuigkeit: neu.has(id),
    });
  }
  const da = new Set(orte.map((o) => o.id));
  const wege = new Map<string, [string, string]>();
  for (const id of besucht) {
    for (const ex of content.maps[id]?.exits ?? []) {
      if (!da.has(id) || !da.has(ex.to.map)) continue;
      const pair = [id, ex.to.map].sort() as [string, string];
      wege.set(pair.join('|'), pair);
    }
  }
  return { orte, wege: [...wege.values()] };
}

/** Figuren im Freundebuch: die Startfigur zuerst, dann alle, die man schon kennt. */
export function friendList(s: GameState, content: Content): string[] {
  const met = Object.values(content.characters)
    .filter((c) => c.id !== content.start.character && c.friend && matches(c.friend.metWhen, s))
    .map((c) => c.id);
  return [content.start.character, ...met];
}

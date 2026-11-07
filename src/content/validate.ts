// Prüft alle Inhaltsreferenzen. Läuft beim Start im Entwicklungsmodus und in den Tests.
import type { Condition, Content, Effect, Trigger } from './types';
import { newGame } from '../game/state';
import { movementBlocked } from '../game/occupancy';
import { gridFor, inBounds, key, reachableSet, standable, terrainAt } from '../game/space';

export function validateContent(c: Content, assetKeys?: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(msg);
  const asset = (k: string | undefined, where: string) => {
    if (k && assetKeys && !assetKeys.has(k)) err(`${where}: Grafikschlüssel „${k}“ fehlt im Asset-Katalog`);
  };

  const condRefs = (cond: Condition | undefined, where: string) => {
    if (!cond) return;
    if ('all' in cond) cond.all.forEach((x) => condRefs(x, where));
    else if ('any' in cond) cond.any.forEach((x) => condRefs(x, where));
    else if ('not' in cond) condRefs(cond.not, where);
    else if ('questNotStarted' in cond && !c.quests[cond.questNotStarted]) err(`${where}: Quest ${cond.questNotStarted} fehlt`);
    else if ('questDone' in cond && !c.quests[cond.questDone]) err(`${where}: Quest ${cond.questDone} fehlt`);
    else if ('questStep' in cond) {
      const q = c.quests[cond.questStep.quest];
      if (!q) err(`${where}: Quest ${cond.questStep.quest} fehlt`);
      else if (!q.steps.some((st) => st.id === cond.questStep.step)) err(`${where}: Schritt ${cond.questStep.step} fehlt in ${q.id}`);
    }
  };
  const effectRefs = (effects: Effect[] | undefined, where: string) => {
    for (const e of effects ?? []) {
      if ('startQuest' in e && !c.quests[e.startQuest]) err(`${where}: Quest ${e.startQuest} fehlt`);
      if ('learnRecipe' in e && !c.recipes[e.learnRecipe]) err(`${where}: Rezept ${e.learnRecipe} fehlt`);
      if ('setDecoOn' in e && c.items[e.setDecoOn.item]?.kind !== 'deco') err(`${where}: ${e.setDecoOn.item} ist keine Deko`);
    }
  };
  const triggerRefs = (t: Trigger, where: string) => {
    if ('hasItems' in t) Object.keys(t.hasItems).forEach((i) => c.items[i] || err(`${where}: Gegenstand ${i} fehlt`));
    if ('crafted' in t && !c.recipes[t.crafted]) err(`${where}: Rezept ${t.crafted} fehlt`);
    if ('placed' in t && !c.items[t.placed]) err(`${where}: Gegenstand ${t.placed} fehlt`);
    if ('dialogue' in t && !c.dialogues.some((d) => d.id === t.dialogue)) err(`${where}: Dialog ${t.dialogue} fehlt`);
  };

  // Figuren und Körper
  const seats = new Map<string, Set<number>>();
  for (const [id, ch] of Object.entries(c.characters)) {
    if (ch.id !== id) err(`Figur ${id}: ID stimmt nicht mit Schlüssel überein`);
    const body = c.bodies[ch.body];
    if (!body) {
      err(`Figur ${id}: Körper ${ch.body} fehlt`);
      continue;
    }
    asset(ch.portrait, `Figur ${id}`);
    if ((body.seats ?? 1) > 1) {
      if (ch.seat === undefined || ch.seat < 0 || ch.seat >= (body.seats ?? 1)) err(`Figur ${id}: Sitzplatz ungültig für ${body.id}`);
      const used = seats.get(body.id) ?? new Set<number>();
      if (ch.seat !== undefined && used.has(ch.seat)) err(`Figur ${id}: Sitzplatz ${ch.seat} in ${body.id} doppelt belegt`);
      if (ch.seat !== undefined) used.add(ch.seat);
      seats.set(body.id, used);
    }
  }
  for (const [id, b] of Object.entries(c.bodies)) {
    if (b.id !== id) err(`Körper ${id}: ID stimmt nicht mit Schlüssel überein`);
    asset(`${b.sprite}.idle.se`, `Körper ${id}`);
  }

  for (const [id, it] of Object.entries(c.items)) {
    if (it.id !== id) err(`Gegenstand ${id}: ID stimmt nicht mit Schlüssel überein`);
    asset(it.sprite, `Gegenstand ${id}`);
    asset(it.deco?.spriteOn, `Gegenstand ${id}`);
    condRefs(it.deco?.toggleWhen, `Gegenstand ${id}`);
  }
  for (const [id, r] of Object.entries(c.recipes)) {
    for (const i of Object.keys(r.inputs)) if (!c.items[i]) err(`Rezept ${id}: Zutat ${i} fehlt`);
    if (!c.items[r.output.item]) err(`Rezept ${id}: Ergebnis ${r.output.item} fehlt`);
  }
  for (const [id, q] of Object.entries(c.quests)) {
    if (q.steps.length === 0) err(`Quest ${id}: keine Schritte`);
    q.steps.forEach((st) => {
      triggerRefs(st.completeWhen, `Quest ${id}/${st.id}`);
      effectRefs(st.onComplete, `Quest ${id}/${st.id}`);
    });
  }
  for (const d of c.dialogues) {
    if (!c.characters[d.character]) err(`Dialog ${d.id}: Figur ${d.character} fehlt`);
    condRefs(d.when, `Dialog ${d.id}`);
    effectRefs(d.effects, `Dialog ${d.id}`);
    for (const line of d.lines) {
      if ('speaker' in line && line.speaker && !c.characters[line.speaker]) err(`Dialog ${d.id}: Sprecher ${line.speaker} fehlt`);
    }
  }
  if (new Set(c.dialogues.map((d) => d.id)).size !== c.dialogues.length) err('Dialog-IDs sind nicht eindeutig');

  // Orte
  const start = c.characters[c.start.character];
  if (!start) err(`Startfigur ${c.start.character} fehlt`);
  if (!c.maps[c.start.map]) err(`Start-Map ${c.start.map} fehlt`);
  const startBody = start ? c.bodies[start.body] : undefined;

  for (const [id, m] of Object.entries(c.maps)) {
    const where = `Map ${id}`;
    const width = m.grid[0]?.length ?? 0;
    if (m.grid.some((row) => row.length !== width)) err(`${where}: Zeilen unterschiedlich lang`);
    for (const row of m.grid) for (const ch of row) if (!m.legend[ch]) err(`${where}: Zeichen „${ch}“ fehlt in der Legende`);
    const g = gridFor(m);
    const land = ['land'] as const;
    if (!inBounds(g, m.arrival) || !standable(terrainAt(g, m.arrival), land)) err(`${where}: Ankunftspunkt nicht begehbar`);
    for (const o of m.objects) {
      asset(o.sprite, `${where}/${o.id}`);
      for (let y = o.tile.y; y < o.tile.y + o.footprint.h; y++)
        for (let x = o.tile.x; x < o.tile.x + o.footprint.w; x++)
          if (!inBounds(g, { x, y }) || terrainAt(g, { x, y }) === 'water') err(`${where}/${o.id}: Grundfläche liegt nicht auf Land`);
    }
    for (const sp of m.gatherSpots) {
      asset(sp.sprite, `${where}/${sp.id}`);
      if (!c.items[sp.item]) err(`${where}/${sp.id}: Gegenstand ${sp.item} fehlt`);
      if (startBody && !standable(terrainAt(g, sp.tile), startBody.moves)) err(`${where}/${sp.id}: Fundstelle nicht erreichbar`);
    }
    const bodiesHere = new Set<string>();
    for (const e of m.encounters) {
      for (const ch of e.characters) {
        const body = c.characters[ch]?.body;
        if (!body) err(`${where}/${e.id}: Figur ${ch} fehlt`);
      }
      for (const b of new Set(e.characters.map((ch) => c.characters[ch]?.body))) {
        if (!b) continue;
        if (bodiesHere.has(b)) err(`${where}: Körper ${b} steht in mehreren Begegnungen`);
        bodiesHere.add(b);
      }
      for (const p of e.placements) {
        condRefs(p.when, `${where}/${e.id}`);
        condRefs(p.talkOnArrival, `${where}/${e.id}`);
        if ('tile' in p.at && !inBounds(g, p.at.tile)) err(`${where}/${e.id}: Platzierung außerhalb der Map`);
        if ('besideDeco' in p.at && c.items[p.at.besideDeco]?.kind !== 'deco') err(`${where}/${e.id}: ${p.at.besideDeco} ist keine Deko`);
      }
    }
    // Wichtige Orte müssen anfangs zu Fuß erreichbar sein.
    const blocked = movementBlocked(newGame(c), m);
    const onFoot = reachableSet(g, blocked, m.arrival, ['land']);
    for (const r of m.keepReachable) {
      if (!onFoot.has(key(g, r.tile))) err(`${where}: Ziel „${r.name}“ ist vom Ankunftspunkt aus nicht zu Fuß erreichbar`);
    }
  }
  return errors;
}

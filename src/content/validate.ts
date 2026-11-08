// Prüft alle Inhaltsreferenzen. Läuft beim Start im Entwicklungsmodus und in den Tests.
import { DEFAULT_STATION, type Condition, type Content, type Effect, type Trigger } from './types';
import { newGame } from '../game/state';
import { movementBlocked } from '../game/occupancy';
import { mustStayReachable } from '../game/rules/placement';
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
    else if ('hasMoment' in cond && !c.moments[cond.hasMoment]) err(`${where}: Moment ${cond.hasMoment} fehlt`);
    else if ('hasItems' in cond) Object.keys(cond.hasItems).forEach((i) => c.items[i] || err(`${where}: Gegenstand ${i} fehlt`));
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
      if ('addMoment' in e && !c.moments[e.addMoment]) err(`${where}: Moment ${e.addMoment} fehlt`);
      if ('setDecoOn' in e && c.items[e.setDecoOn.item]?.kind !== 'deco') err(`${where}: ${e.setDecoOn.item} ist keine Deko`);
      if ('unlockCharacter' in e && !c.characters[e.unlockCharacter]) err(`${where}: Figur ${e.unlockCharacter} fehlt`);
      for (const items of ['giveItems' in e ? e.giveItems : {}, 'takeItems' in e ? e.takeItems : {}]) {
        for (const [i, n] of Object.entries(items)) {
          if (!c.items[i]) err(`${where}: Gegenstand ${i} fehlt`);
          if (!Number.isInteger(n) || n <= 0) err(`${where}: Anzahl für ${i} muss eine positive Ganzzahl sein`);
        }
      }
    }
  };
  /** Sind diese Gegenstände durch die Bedingung sicher im Beutel? (nur `hasItems` direkt oder in `all`) */
  const guarantees = (cond: Condition | undefined, items: Record<string, number>): boolean => {
    if (!cond) return false;
    if ('hasItems' in cond) return Object.entries(items).every(([i, n]) => (cond.hasItems[i] ?? 0) >= n);
    if ('all' in cond) {
      return Object.entries(items).every(([i, n]) => cond.all.some((x) => guarantees(x, { [i]: n })));
    }
    return false;
  };
  const triggerRefs = (t: Trigger, where: string) => {
    if ('hasItems' in t) Object.keys(t.hasItems).forEach((i) => c.items[i] || err(`${where}: Gegenstand ${i} fehlt`));
    if ('crafted' in t && !c.recipes[t.crafted]) err(`${where}: Rezept ${t.crafted} fehlt`);
    if ('placed' in t && !c.items[t.placed]) err(`${where}: Gegenstand ${t.placed} fehlt`);
    if ('dialogue' in t && !c.dialogues.some((d) => d.id === t.dialogue)) err(`${where}: Dialog ${t.dialogue} fehlt`);
    if ('atMap' in t && !c.maps[t.atMap]) err(`${where}: Map ${t.atMap} fehlt`);
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
    condRefs(ch.friend?.metWhen, `Figur ${id}`);
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
  for (const [id, m] of Object.entries(c.moments)) {
    if (m.id !== id) err(`Moment ${id}: ID stimmt nicht mit Schlüssel überein`);
    if (!c.characters[m.character]) err(`Moment ${id}: Figur ${m.character} fehlt`);
  }

  for (const [id, it] of Object.entries(c.items)) {
    if (it.id !== id) err(`Gegenstand ${id}: ID stimmt nicht mit Schlüssel überein`);
    asset(it.sprite, `Gegenstand ${id}`);
    asset(it.deco?.spriteOn, `Gegenstand ${id}`);
    condRefs(it.deco?.toggleWhen, `Gegenstand ${id}`);
  }
  const stations = new Set(
    Object.values(c.maps).flatMap((m) =>
      m.objects.flatMap((o) => (o.interaction?.kind === 'workbench' ? [o.interaction.station ?? DEFAULT_STATION] : [])),
    ),
  );
  for (const [id, r] of Object.entries(c.recipes)) {
    if (r.id !== id) err(`Rezept ${id}: ID stimmt nicht mit Schlüssel überein`);
    for (const i of Object.keys(r.inputs)) if (!c.items[i]) err(`Rezept ${id}: Zutat ${i} fehlt`);
    if (!c.items[r.output.item]) err(`Rezept ${id}: Ergebnis ${r.output.item} fehlt`);
    if (!stations.has(r.station ?? DEFAULT_STATION)) err(`Rezept ${id}: keine Station „${r.station ?? DEFAULT_STATION}“ in irgendeiner Map`);
  }
  for (const [id, q] of Object.entries(c.quests)) {
    if (q.steps.length === 0) err(`Quest ${id}: keine Schritte`);
    if (q.giver && !c.characters[q.giver]) err(`Quest ${id}: Auftraggeberin ${q.giver} fehlt`);
    condRefs(q.offer?.when, `Quest ${id}`);
    q.steps.forEach((st) => {
      triggerRefs(st.completeWhen, `Quest ${id}/${st.id}`);
      effectRefs(st.onComplete, `Quest ${id}/${st.id}`);
      if (st.onComplete?.some((e) => 'takeItems' in e)) err(`Quest ${id}/${st.id}: Abgeben (takeItems) geht nur in Dialogen`);
    });
  }
  for (const d of c.dialogues) {
    if (!c.characters[d.character]) err(`Dialog ${d.id}: Figur ${d.character} fehlt`);
    condRefs(d.when, `Dialog ${d.id}`);
    effectRefs(d.effects, `Dialog ${d.id}`);
    for (const e of d.effects ?? []) {
      // Sonst würde das Gespräch ohne die Gegenstände immer wieder kommen und nie abschließen.
      if ('takeItems' in e && !guarantees(d.when, e.takeItems)) err(`Dialog ${d.id}: Abgeben braucht passende hasItems-Bedingung`);
    }
    for (const line of d.lines) {
      if ('speaker' in line && line.speaker && !c.characters[line.speaker]) err(`Dialog ${d.id}: Sprecher ${line.speaker} fehlt`);
      if ('choices' in line && line.choices) {
        if (line.choices.length === 0 || line.choices.some((ch) => !ch.label.trim())) err(`Dialog ${d.id}: leere Antwortmöglichkeit`);
        if (!line.choices.some((ch) => ch.then === 'weiter')) err(`Dialog ${d.id}: Antworten brauchen mindestens ein „weiter“`);
      }
    }
  }
  if (new Set(c.dialogues.map((d) => d.id)).size !== c.dialogues.length) err('Dialog-IDs sind nicht eindeutig');

  // Begegnungen: pro Körper genau eine, alle Figuren einer Begegnung teilen denselben Körper.
  const bodiesSeen = new Set<string>();
  for (const e of c.encounters) {
    const where = `Begegnung ${e.id}`;
    if (e.characters.length === 0) err(`${where}: keine Figur`);
    for (const ch of e.characters) if (!c.characters[ch]) err(`${where}: Figur ${ch} fehlt`);
    const bodyIds = new Set(e.characters.map((ch) => c.characters[ch]?.body));
    if (bodyIds.size > 1) err(`${where}: Figuren mit verschiedenen Körpern – pro Körper eine eigene Begegnung`);
    const bodyId = [...bodyIds][0];
    const body = bodyId ? c.bodies[bodyId] : undefined;
    if (bodyId && bodiesSeen.has(bodyId)) err(`${where}: Körper ${bodyId} hat schon eine Begegnung`);
    if (bodyId) bodiesSeen.add(bodyId);
    for (const p of e.placements) {
      condRefs(p.when, where);
      condRefs(p.talkOnArrival, where);
      const m = c.maps[p.map];
      if (!m) {
        err(`${where}: Map ${p.map} fehlt`);
        continue;
      }
      if ('tile' in p.at) {
        const g = gridFor(m);
        if (!inBounds(g, p.at.tile)) err(`${where}: Platzierung außerhalb von ${m.id}`);
        else if (body && !standable(terrainAt(g, p.at.tile), body.moves)) {
          err(`${where}: ${body.id} kann auf ${m.id} bei ${p.at.tile.x},${p.at.tile.y} nicht stehen`);
        }
      }
      if ('besideDeco' in p.at && c.items[p.at.besideDeco]?.kind !== 'deco') err(`${where}: ${p.at.besideDeco} ist keine Deko`);
    }
  }

  // Orte
  const start = c.characters[c.start.character];
  if (!start) err(`Startfigur ${c.start.character} fehlt`);
  if (!c.maps[c.start.map]) err(`Start-Map ${c.start.map} fehlt`);
  const startBody = start ? c.bodies[start.body] : undefined;

  for (const [id, m] of Object.entries(c.maps)) {
    const where = `Map ${id}`;
    if (m.id !== id) err(`${where}: ID stimmt nicht mit Schlüssel überein`);
    const width = m.grid[0]?.length ?? 0;
    if (m.grid.some((row) => row.length !== width)) err(`${where}: Zeilen unterschiedlich lang`);
    for (const row of m.grid) for (const ch of row) if (!m.legend[ch]) err(`${where}: Zeichen „${ch}“ fehlt in der Legende`);
    const g = gridFor(m);
    const land = ['land'] as const;
    const onLand = (t: { x: number; y: number }) => inBounds(g, t) && standable(terrainAt(g, t), land);
    if (!onLand(m.arrival)) err(`${where}: Ankunftspunkt nicht begehbar`);
    for (const o of m.objects) {
      asset(o.sprite, `${where}/${o.id}`);
      for (let y = o.tile.y; y < o.tile.y + o.footprint.h; y++)
        for (let x = o.tile.x; x < o.tile.x + o.footprint.w; x++)
          if (!inBounds(g, { x, y }) || terrainAt(g, { x, y }) === 'water') err(`${where}/${o.id}: Grundfläche liegt nicht auf Land`);
      const ia = o.interaction;
      if (ia?.kind === 'exit' && !m.exits.some((e) => e.id === ia.exit)) err(`${where}/${o.id}: Ausgang ${ia.exit} fehlt`);
    }
    for (const sp of m.gatherSpots) {
      asset(sp.sprite, `${where}/${sp.id}`);
      condRefs(sp.availableWhen, `${where}/${sp.id}`);
      if (sp.regrowMinutes !== undefined && !(sp.regrowMinutes > 0)) err(`${where}/${sp.id}: Nachwachszeit muss positiv sein`);
      if (!c.items[sp.item]) err(`${where}/${sp.id}: Gegenstand ${sp.item} fehlt`);
      if (startBody && !standable(terrainAt(g, sp.tile), startBody.moves)) err(`${where}/${sp.id}: Fundstelle nicht erreichbar`);
    }
    if (new Set(m.entries.map((e) => e.id)).size !== m.entries.length) err(`${where}: Ankunftspunkt-IDs doppelt`);
    for (const en of m.entries) if (!onLand(en.tile)) err(`${where}/${en.id}: Ankunftspunkt nicht begehbar`);
    for (const ex of m.exits) {
      if (ex.tiles.length === 0) err(`${where}/${ex.id}: Ausgang ohne Kacheln`);
      for (const t of ex.tiles) if (!onLand(t)) err(`${where}/${ex.id}: Ausgangskachel ${t.x},${t.y} nicht begehbar`);
      const target = c.maps[ex.to.map];
      if (!target) {
        err(`${where}/${ex.id}: Ziel-Map ${ex.to.map} fehlt`);
        continue;
      }
      if (!target.entries.some((en) => en.id === ex.to.entry)) err(`${where}/${ex.id}: Ankunftspunkt ${ex.to.entry} fehlt in ${target.id}`);
      // Hin- und Rückweg: vom Ziel muss ein Ausgang zurückführen.
      if (!target.exits.some((back) => back.to.map === m.id)) err(`${where}/${ex.id}: von ${target.id} führt kein Weg zurück`);
    }
    // Wichtige Orte, Ausgänge und Ankunftspunkte müssen anfangs zu Fuß erreichbar sein.
    const blocked = movementBlocked(newGame(c), m);
    const onFoot = reachableSet(g, blocked, m.arrival, ['land']);
    for (const r of mustStayReachable(m)) {
      if (!onFoot.has(key(g, r.tile))) err(`${where}: Ziel „${r.name}“ bei ${r.tile.x},${r.tile.y} ist vom sicheren Platz aus nicht zu Fuß erreichbar`);
    }
  }

  // Jede Map muss von der Start-Map aus über Ausgänge erreichbar sein.
  const reached = new Set<string>([c.start.map]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const id of [...reached]) {
      for (const ex of c.maps[id]?.exits ?? []) {
        if (c.maps[ex.to.map] && !reached.has(ex.to.map)) {
          reached.add(ex.to.map);
          grew = true;
        }
      }
    }
  }
  for (const id of Object.keys(c.maps)) if (!reached.has(id)) err(`Map ${id}: von der Start-Map aus nicht erreichbar`);
  return errors;
}

// Macht aus einem rohen (älteren, beschädigten oder fremden) Stand einen gültigen GameState.
// Neue Felder bekommen Standardwerte, unbekannte IDs werden verworfen, ungültige Positionen auf den Ankunftspunkt gesetzt.
import type { Content } from '../../content/types';
import type { Dir, GameState, PlacedDeco, QuestProgress, Tile } from '../types';
import { newGame, SCHEMA } from '../state';
import { cleanName } from '../rules/name';
import { gridFor, inBounds, standable, terrainAt } from '../space';

/**
 * Migrationen: Schlüssel = Ausgangsversion, Ergebnis = Stand der nächsten Version.
 * Danach füllt normalizeState alles Fehlende mit Standardwerten und verwirft Unbekanntes.
 */
const migrations: Record<number, (s: Record<string, unknown>) => Record<string, unknown>> = {
  // 1 -> 2 (Version 0.3.0): Figurenwechsel. Bisher war nur die Startfigur spielbar.
  1: (s) => ({ ...s, unlocked: [] }),
};

export interface NormalizeResult {
  state: GameState;
  notes: string[];
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isTile = (v: unknown): v is Tile => isObj(v) && Number.isInteger(v.x) && Number.isInteger(v.y);
const DIRS: Dir[] = ['se', 'sw', 'ne', 'nw'];

export function normalizeState(raw: unknown, schema: number, content: Content): NormalizeResult {
  const notes: string[] = [];
  let src: Record<string, unknown> = isObj(raw) ? raw : {};
  for (let v = schema; v < SCHEMA; v++) {
    const m = migrations[v];
    if (m) src = m(src);
  }
  const base = newGame(content);
  const s: GameState = base;

  // Spielerin
  if (isObj(src.player) && typeof src.player.name === 'string') {
    s.player.name = cleanName(src.player.name);
  }

  // Spielbare Figuren (die Startfigur immer) und aktive Figur
  if (Array.isArray(src.unlocked)) {
    for (const c of src.unlocked) {
      if (typeof c === 'string' && content.characters[c] && !s.unlocked.includes(c)) s.unlocked.push(c);
    }
  }
  if (typeof src.activeCharacter === 'string' && content.characters[src.activeCharacter] && s.unlocked.includes(src.activeCharacter)) {
    s.activeCharacter = src.activeCharacter;
  } else if (src.activeCharacter !== undefined && src.activeCharacter !== s.activeCharacter) {
    notes.push(`Figur ${String(src.activeCharacter)} ist nicht spielbar – zurück zur Startfigur.`);
  }

  // Inventar: nur bekannte Gegenstände mit positiver Ganzzahl
  if (isObj(src.inventory)) {
    for (const [item, n] of Object.entries(src.inventory)) {
      if (!content.items[item]) {
        notes.push(`Unbekannter Gegenstand ${item} verworfen.`);
        continue;
      }
      if (Number.isInteger(n) && (n as number) > 0) s.inventory[item] = n as number;
    }
  }

  if (Array.isArray(src.recipesKnown)) {
    s.recipesKnown = [...new Set(src.recipesKnown.filter((r): r is string => typeof r === 'string' && !!content.recipes[r]))];
  }

  if (Array.isArray(src.gathered)) {
    s.gathered = [
      ...new Set(
        src.gathered.filter((k): k is string => {
          if (typeof k !== 'string') return false;
          const [mapId, spotId] = k.split('/');
          return !!content.maps[mapId ?? '']?.gatherSpots.some((sp) => sp.id === spotId);
        }),
      ),
    ];
  }

  if (isObj(src.quests)) {
    for (const [qid, p] of Object.entries(src.quests)) {
      const quest = content.quests[qid];
      if (!quest || !isObj(p)) {
        notes.push(`Unbekannte Quest ${qid} verworfen.`);
        continue;
      }
      const done = p.done === true;
      const stepOk = typeof p.step === 'string' && quest.steps.some((st) => st.id === p.step);
      const step = stepOk ? (p.step as string) : quest.steps[0]!.id;
      if (!stepOk && !done) notes.push(`Questschritt von ${qid} unbekannt – Schritt zurückgesetzt.`);
      s.quests[qid] = { step, done } satisfies QuestProgress;
    }
  }

  if (Array.isArray(src.claimed)) s.claimed = [...new Set(src.claimed.filter((c): c is string => typeof c === 'string'))];
  if (Array.isArray(src.moments)) s.moments = [...new Set(src.moments.filter((m): m is string => typeof m === 'string'))];

  // Deko: bekannte Gegenstände auf bekannten Maps, gültige Kacheln, keine doppelten UIDs
  if (Array.isArray(src.deco)) {
    const uids = new Set<string>();
    for (const dd of src.deco) {
      if (!isObj(dd) || typeof dd.uid !== 'string' || typeof dd.item !== 'string' || typeof dd.map !== 'string') continue;
      const map = content.maps[dd.map];
      if (!content.items[dd.item] || !map || !isTile(dd.tile) || !inBounds(gridFor(map), dd.tile) || uids.has(dd.uid)) {
        notes.push(`Deko ${String(dd.uid)} verworfen.`);
        continue;
      }
      uids.add(dd.uid);
      s.deco.push({ uid: dd.uid, item: dd.item, map: dd.map, tile: { x: dd.tile.x, y: dd.tile.y }, on: dd.on === true } satisfies PlacedDeco);
    }
  }
  const maxId = Math.max(0, ...s.deco.map((dd) => Number(dd.uid.replace(/^deco-/, '')) || 0));
  s.nextDecoId = Math.max(Number.isInteger(src.nextDecoId) ? (src.nextDecoId as number) : 1, maxId + 1);

  if (isObj(src.settings)) {
    if (typeof src.settings.sound === 'boolean') s.settings.sound = src.settings.sound;
    if (typeof src.settings.haptics === 'boolean') s.settings.haptics = src.settings.haptics;
  }

  // Position: nur übernehmen, wenn die Figur dort sicher stehen kann – sonst Ankunftspunkt.
  const loc = isObj(src.location) ? src.location : null;
  const map = loc && typeof loc.map === 'string' ? content.maps[loc.map] : undefined;
  const body = content.bodies[content.characters[s.activeCharacter]?.body ?? ''];
  const t = loc && isTile(loc.tile) ? loc.tile : null;
  if (loc && map && body && t) {
    const g = gridFor(map);
    const blockedByDeco = s.deco.some((dd) => dd.map === map.id && dd.tile.x === t.x && dd.tile.y === t.y);
    const inObject = map.objects.some(
      (o) => t.x >= o.tile.x && t.x < o.tile.x + o.footprint.w && t.y >= o.tile.y && t.y < o.tile.y + o.footprint.h,
    );
    if (standable(terrainAt(g, t), body.moves) && !blockedByDeco && !inObject) {
      s.location = { map: map.id, tile: { x: t.x, y: t.y }, facing: DIRS.includes(loc.facing as Dir) ? (loc.facing as Dir) : 'se' };
    } else {
      s.location = { map: map.id, tile: { ...map.arrival }, facing: 'se' };
      notes.push('Gespeicherte Position ungültig – Figur am Ankunftspunkt abgesetzt.');
    }
  } else if (loc) {
    notes.push('Gespeicherter Ort unbekannt – zurück zum Startufer.');
  }

  return { state: s, notes };
}

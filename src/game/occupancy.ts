// Wer und was belegt welche Kachel – und wo stehen die Figuren gerade (abgeleitet aus Inhalt + Spielstand).
import type { Content, MapDef } from '../content/types';
import type { Dir, GameState, Tile } from './types';
import { matches } from './conditions';
import { gridFor, key, rectTiles, standable, terrainAt, type Grid } from './space';

/** Kacheln, die Gebäude, Möbel und Wegweiser dauerhaft belegen. */
export function objectTiles(map: MapDef): Tile[] {
  return map.objects.flatMap((o) => rectTiles({ x: o.tile.x, y: o.tile.y, w: o.footprint.w, h: o.footprint.h }));
}

export function decoTiles(s: GameState, mapId: string, ignoreUid?: string): Tile[] {
  return s.deco.filter((d) => d.map === mapId && d.uid !== ignoreUid).map((d) => d.tile);
}

/** Noch nicht eingesammelte Fundstellen (auch die, die erst später erscheinen – dort darf keine Deko hin). */
export function openSpotTiles(s: GameState, map: MapDef): Tile[] {
  return map.gatherSpots.filter((sp) => !s.gathered.includes(`${map.id}/${sp.id}`)).map((sp) => sp.tile);
}

export function exitTiles(map: MapDef): Tile[] {
  return map.exits.flatMap((e) => e.tiles);
}

/** Blockiert für Bewegung: Gebäude, Möbel und aufgestellte Deko. Fundstellen und Figuren blockieren nicht. */
export function movementBlocked(s: GameState, map: MapDef, ignoreDecoUid?: string): Set<number> {
  const g = gridFor(map);
  return new Set([...objectTiles(map), ...decoTiles(s, map.id, ignoreDecoUid)].map((t) => key(g, t)));
}

/** Körper der aktiven Figur. */
export function activeBodyId(s: GameState, content: Content): string | undefined {
  return content.characters[s.activeCharacter]?.body;
}

export interface NpcPlacement {
  body: string;
  characters: string[];
  encounter: string;
  map: string;
  tile: Tile;
  pose: 'idle' | 'sit';
  facing: Dir;
  /** Nach dem Hinlaufen von selbst ansprechen. */
  talk: boolean;
}

const BESIDE: Array<[number, number]> = [
  [1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1], [0, -1], [1, -1], [-1, -1],
];

/**
 * Wo stehen die Nichtspielerfiguren gerade – über alle Maps?
 * - Jeder Körper hat genau eine Begegnung; die erste passende Platzierung gilt. Damit gibt es
 *   pro Körper-ID höchstens eine Instanz in der ganzen Welt (drei Erbsen = eine Schale).
 * - Der Körper der aktiven Figur gehört der Spielerin und taucht hier nicht auf.
 */
export function resolveAllNpcs(s: GameState, content: Content, opts: { includePlayer?: boolean } = {}): NpcPlacement[] {
  // includePlayer: auch den Ruheplatz des gerade gespielten Körpers liefern (dort darf keine Deko hin).
  const playerBody = opts.includePlayer ? undefined : activeBodyId(s, content);
  const seen = new Set<string>();
  const out: NpcPlacement[] = [];

  for (const enc of content.encounters) {
    const bodyId = content.characters[enc.characters[0] ?? '']?.body;
    if (!bodyId || bodyId === playerBody || seen.has(bodyId)) continue;
    const body = content.bodies[bodyId];
    if (!body) continue;
    seen.add(bodyId);
    for (const p of enc.placements) {
      if (!matches(p.when, s)) continue;
      const map = content.maps[p.map];
      if (!map) continue;
      let tile: Tile | null = null;
      let facing = p.facing;
      if ('tile' in p.at) {
        tile = p.at.tile;
        // Steht dort inzwischen Deko (z. B. aus einem älteren Spielstand), weicht die Figur auf den Nachbarplatz aus.
        const g = gridFor(map);
        const hardBlocked = movementBlocked(s, map);
        if (hardBlocked.has(key(g, tile))) {
          tile = besideTile(g, s, map, tile, body.moves, out.filter((n) => n.map === map.id));
        }
      } else {
        const item = p.at.besideDeco;
        const deco = s.deco.find((d) => d.map === map.id && d.item === item);
        if (deco) {
          const taken = out.filter((n) => n.map === map.id);
          tile = besideTile(gridFor(map), s, map, deco.tile, body.moves, taken);
          if (tile) facing = tile.x <= deco.tile.x ? 'se' : 'sw';
        }
      }
      if (!tile) continue;
      out.push({
        body: bodyId,
        characters: enc.characters.filter((c) => content.characters[c]?.body === bodyId),
        encounter: enc.id,
        map: map.id,
        tile,
        pose: p.pose,
        facing,
        talk: p.talkOnArrival ? matches(p.talkOnArrival, s) : false,
      });
      break;
    }
  }
  return out;
}

/** Die Nichtspielerfiguren auf einer Map. */
export function resolveNpcs(s: GameState, content: Content, mapId: string): NpcPlacement[] {
  return resolveAllNpcs(s, content).filter((n) => n.map === mapId);
}

function besideTile(
  g: Grid,
  s: GameState,
  map: MapDef,
  anchor: Tile,
  moves: readonly ('land' | 'water')[],
  taken: NpcPlacement[],
): Tile | null {
  const busy = new Set(
    [...objectTiles(map), ...decoTiles(s, map.id), ...openSpotTiles(s, map), ...exitTiles(map), ...taken.map((n) => n.tile)].map(
      (t) => key(g, t),
    ),
  );
  for (const [dx, dy] of BESIDE) {
    const t = { x: anchor.x + dx, y: anchor.y + dy };
    if (busy.has(key(g, t))) continue;
    // Nur auf festem Boden hinsetzen, nicht im Wasser.
    const terr = terrainAt(g, t);
    if (terr === 'water' || !standable(terr, moves)) continue;
    return t;
  }
  return null;
}

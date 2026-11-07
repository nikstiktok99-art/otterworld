// Wer und was belegt welche Kachel – und wo stehen die Figuren gerade (abgeleitet aus Inhalt + Spielstand).
import type { Content, MapDef } from '../content/types';
import type { Dir, GameState, Tile } from './types';
import { matches } from './conditions';
import { gridFor, key, rectTiles, standable, terrainAt, type Grid } from './space';

/** Kacheln, die Gebäude und Möbel dauerhaft belegen. */
export function objectTiles(map: MapDef): Tile[] {
  return map.objects.flatMap((o) => rectTiles({ x: o.tile.x, y: o.tile.y, w: o.footprint.w, h: o.footprint.h }));
}

export function decoTiles(s: GameState, mapId: string, ignoreUid?: string): Tile[] {
  return s.deco.filter((d) => d.map === mapId && d.uid !== ignoreUid).map((d) => d.tile);
}

export function openSpotTiles(s: GameState, map: MapDef): Tile[] {
  return map.gatherSpots.filter((sp) => !s.gathered.includes(`${map.id}/${sp.id}`)).map((sp) => sp.tile);
}

/** Blockiert für Bewegung: Gebäude, Möbel und aufgestellte Deko. Fundstellen und Figuren blockieren nicht. */
export function movementBlocked(s: GameState, map: MapDef, ignoreDecoUid?: string): Set<number> {
  const g = gridFor(map);
  return new Set([...objectTiles(map), ...decoTiles(s, map.id, ignoreDecoUid)].map((t) => key(g, t)));
}

export interface NpcPlacement {
  body: string;
  characters: string[];
  encounter: string;
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
 * Welche Weltkörper stehen als Nichtspielerfiguren auf dieser Map, und wo?
 * - Pro Körper-ID höchstens eine Instanz (drei Erbsen = eine Schale).
 * - Der Körper der aktiven Figur gehört der Spielerin und taucht hier nicht auf.
 */
export function resolveNpcs(s: GameState, content: Content, mapId: string): NpcPlacement[] {
  const map = content.maps[mapId];
  if (!map) return [];
  const g = gridFor(map);
  const playerBody = content.characters[s.activeCharacter]?.body;
  const seen = new Set<string>();
  const out: NpcPlacement[] = [];

  for (const enc of map.encounters) {
    const bodyIds = [...new Set(enc.characters.map((c) => content.characters[c]?.body).filter((b): b is string => !!b))];
    for (const bodyId of bodyIds) {
      if (bodyId === playerBody || seen.has(bodyId)) continue;
      const body = content.bodies[bodyId];
      if (!body) continue;
      for (const p of enc.placements) {
        if (!matches(p.when, s)) continue;
        let tile: Tile | null = null;
        let facing = p.facing;
        if ('tile' in p.at) {
          tile = p.at.tile;
        } else {
          const item = p.at.besideDeco;
          const deco = s.deco.find((d) => d.map === mapId && d.item === item);
          if (deco) {
            tile = besideTile(g, s, map, deco.tile, body.moves, out);
            if (tile) facing = tile.x <= deco.tile.x ? 'se' : 'sw';
          }
        }
        if (!tile) continue;
        out.push({
          body: bodyId,
          characters: enc.characters.filter((c) => content.characters[c]?.body === bodyId),
          encounter: enc.id,
          tile,
          pose: p.pose,
          facing,
          talk: p.talkOnArrival ? matches(p.talkOnArrival, s) : false,
        });
        seen.add(bodyId);
        break;
      }
    }
  }
  return out;
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
    [...objectTiles(map), ...decoTiles(s, map.id), ...openSpotTiles(s, map), ...taken.map((n) => n.tile)].map((t) =>
      key(g, t),
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

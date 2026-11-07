// Darf Deko auf diese Kachel? Einzige Stelle für diese Regel – Dekoriermodus (Vorschau) und Aktion nutzen sie gleichermaßen.
import type { Content } from '../../content/types';
import type { RejectReason } from '../actions';
import type { GameState, Tile } from '../types';
import { decoTiles, movementBlocked, objectTiles, openSpotTiles, resolveNpcs } from '../occupancy';
import { gridFor, inBounds, isLand, key, reachableSet, terrainAt } from '../space';

export interface PlacementProblem {
  reason: RejectReason;
  detail?: string;
}

export function checkPlacement(
  s: GameState,
  content: Content,
  mapId: string,
  tile: Tile,
  ignoreUid?: string,
): PlacementProblem | null {
  const map = content.maps[mapId];
  if (!map) return { reason: 'unknown' };
  const g = gridFor(map);
  if (!inBounds(g, tile)) return { reason: 'notPlaceable' };

  const z = map.decorZone;
  if (tile.x < z.x || tile.y < z.y || tile.x >= z.x + z.w || tile.y >= z.y + z.h) return { reason: 'outsideZone' };
  if (!isLand(terrainAt(g, tile))) return { reason: 'notPlaceable' };

  const k = key(g, tile);
  const taken = new Set(
    [
      ...objectTiles(map),
      ...decoTiles(s, mapId, ignoreUid),
      ...openSpotTiles(s, map),
      ...map.keepReachable.map((r) => r.tile),
      ...resolveNpcs(s, content, mapId).map((n) => n.tile),
      ...(s.location.map === mapId ? [s.location.tile] : []),
    ].map((t) => key(g, t)),
  );
  if (taken.has(k)) return { reason: 'occupied' };

  // Nach dem Aufstellen müssen wichtige Orte zu Fuß erreichbar bleiben (z. B. der Steg).
  const blocked = movementBlocked(s, map, ignoreUid);
  blocked.add(k);
  const onFoot = reachableSet(g, blocked, map.arrival, ['land']);
  for (const r of map.keepReachable) {
    if (!onFoot.has(key(g, r.tile))) return { reason: 'blocksPath', detail: r.name };
  }

  // Offene Fundstellen müssen für die aktive Figur erreichbar bleiben (zu Fuß oder schwimmend).
  const body = content.bodies[content.characters[s.activeCharacter]?.body ?? ''];
  if (body) {
    const forBody = reachableSet(g, blocked, map.arrival, body.moves);
    for (const t of openSpotTiles(s, map)) {
      if (!forBody.has(key(g, t))) return { reason: 'blocksPath', detail: 'eine Fundstelle' };
    }
  }
  return null;
}

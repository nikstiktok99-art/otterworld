// Darf Deko auf diese Kachel? Einzige Stelle für diese Regel – Dekoriermodus (Vorschau) und Aktion nutzen sie gleichermaßen.
import type { Content, MapDef } from '../../content/types';
import type { RejectReason } from '../actions';
import type { GameState, Tile } from '../types';
import { activeBodyId, decoTiles, exitTiles, movementBlocked, objectTiles, openSpotTiles, resolveAllNpcs } from '../occupancy';
import { gridFor, inBounds, isLand, key, reachableSet, terrainAt } from '../space';

export interface PlacementProblem {
  reason: RejectReason;
  detail?: string;
}

/** Was zu Fuß erreichbar bleiben muss: die Ziele der Map, alle Ausgänge und Ankunftspunkte. */
export function mustStayReachable(map: MapDef): Array<{ tile: Tile; name: string }> {
  return [
    ...map.keepReachable,
    ...map.exits.map((e) => ({ tile: e.tiles[0]!, name: e.keepName })),
    ...map.entries.map((e) => ({ tile: e.tile, name: 'den Weg' })),
  ];
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
  if (!z || tile.x < z.x || tile.y < z.y || tile.x >= z.x + z.w || tile.y >= z.y + z.h) return { reason: 'outsideZone' };
  if (!isLand(terrainAt(g, tile))) return { reason: 'notPlaceable' };

  const musts = mustStayReachable(map);
  const k = key(g, tile);
  const taken = new Set(
    [
      ...objectTiles(map),
      ...decoTiles(s, mapId, ignoreUid),
      ...openSpotTiles(s, map),
      ...exitTiles(map),
      ...musts.map((r) => r.tile),
      // Plätze aller Figuren – auch der Ruheplatz der gerade gespielten, falls sie später wechselt.
      ...resolveAllNpcs(s, content, { includePlayer: true })
        .filter((n) => n.map === mapId)
        .map((n) => n.tile),
      ...(s.location.map === mapId ? [s.location.tile] : []),
    ].map((t) => key(g, t)),
  );
  if (taken.has(k)) return { reason: 'occupied' };

  // Nach dem Aufstellen müssen wichtige Orte und Ausgänge zu Fuß erreichbar bleiben (z. B. der Steg).
  const blocked = movementBlocked(s, map, ignoreUid);
  blocked.add(k);
  const onFoot = reachableSet(g, blocked, map.arrival, ['land']);
  for (const r of musts) {
    if (!onFoot.has(key(g, r.tile))) return { reason: 'blocksPath', detail: r.name };
  }

  // Offene Fundstellen müssen für die aktive Figur erreichbar bleiben (zu Fuß oder schwimmend).
  const body = content.bodies[activeBodyId(s, content) ?? ''];
  if (body) {
    const forBody = reachableSet(g, blocked, map.arrival, body.moves);
    for (const t of openSpotTiles(s, map)) {
      if (!forBody.has(key(g, t))) return { reason: 'blocksPath', detail: 'eine Fundstelle' };
    }
  }
  return null;
}

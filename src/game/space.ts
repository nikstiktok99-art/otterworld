// Raumlogik auf dem Kachelraster: begehbar, beschwimmbar, Wege, Erreichbarkeit.
// Reine Funktionen – die Spielregeln (Deko-Platzierung) und die Welt (Bewegung) nutzen dieselbe Quelle.
import type { MapDef, Movement, Terrain } from '../content/types';
import type { Tile } from './types';

export const TILE = 16;

export interface Grid {
  id: string;
  w: number;
  h: number;
  cells: Terrain[];
}

const cache = new Map<string, Grid>();

export function gridFor(map: MapDef): Grid {
  const hit = cache.get(map.id);
  if (hit && hit.cells.length === map.grid.length * (map.grid[0]?.length ?? 0)) return hit;
  const h = map.grid.length;
  const w = map.grid[0]?.length ?? 0;
  const cells: Terrain[] = [];
  for (const row of map.grid) {
    for (const ch of row) cells.push(map.legend[ch] ?? 'blocked');
  }
  const grid: Grid = { id: map.id, w, h, cells };
  cache.set(map.id, grid);
  return grid;
}

export const key = (g: Grid, t: Tile): number => t.y * g.w + t.x;
export const tileOf = (g: Grid, k: number): Tile => ({ x: k % g.w, y: Math.floor(k / g.w) });
export const inBounds = (g: Grid, t: Tile): boolean => t.x >= 0 && t.y >= 0 && t.x < g.w && t.y < g.h;

export function terrainAt(g: Grid, t: Tile): Terrain {
  if (!inBounds(g, t)) return 'blocked';
  return g.cells[key(g, t)] ?? 'blocked';
}

/** Kann ein Körper mit diesen Bewegungsarten auf diesem Untergrund stehen? */
export function standable(terrain: Terrain, moves: readonly Movement[]): boolean {
  if (terrain === 'blocked' || terrain === 'schilf' || terrain === 'zaun' || terrain === 'wand') return false;
  if (terrain === 'water') return moves.includes('water');
  return moves.includes('land'); // Sand, Gras, Blumen, Steg, Pfad
}

/** Boden, auf dem Deko stehen darf (Steg und Pfade bleiben frei). */
export const isLand = (t: Terrain): boolean => t === 'sand' || t === 'grass' || t === 'blumen' || t === 'boden';

/**
 * Nächste Kachel ab `from` (Breitensuche über das ganze Raster), auf der ein Körper sicher stehen kann.
 * Für Ortswechsel und Figurenwechsel: Die Figur landet nie im Gebüsch, in einem Gebäude oder (als Landtier) im Wasser.
 */
export function nearestStandable(
  g: Grid,
  blocked: ReadonlySet<number>,
  from: Tile,
  moves: readonly Movement[],
): Tile | null {
  if (!inBounds(g, from)) return null;
  const seen = new Set<number>([key(g, from)]);
  const queue: Tile[] = [from];
  while (queue.length > 0) {
    const t = queue.shift()!;
    if (passable(g, blocked, t, moves)) return t;
    for (const [dx, dy] of STEPS) {
      const n = { x: t.x + dx, y: t.y + dy };
      if (!inBounds(g, n) || seen.has(key(g, n))) continue;
      seen.add(key(g, n));
      queue.push(n);
    }
  }
  return null;
}

function passable(g: Grid, blocked: ReadonlySet<number>, t: Tile, moves: readonly Movement[]): boolean {
  return inBounds(g, t) && !blocked.has(key(g, t)) && standable(terrainAt(g, t), moves);
}

const STEPS: Array<[number, number, number]> = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

/** Nachbarn mit 8 Richtungen, ohne Ecken abzuschneiden. */
function* neighbors(g: Grid, blocked: ReadonlySet<number>, t: Tile, moves: readonly Movement[]) {
  for (const [dx, dy, cost] of STEPS) {
    const n = { x: t.x + dx, y: t.y + dy };
    if (!passable(g, blocked, n, moves)) continue;
    if (dx !== 0 && dy !== 0) {
      if (!passable(g, blocked, { x: t.x + dx, y: t.y }, moves)) continue;
      if (!passable(g, blocked, { x: t.x, y: t.y + dy }, moves)) continue;
    }
    yield { tile: n, cost };
  }
}

/**
 * Kürzester Weg zu irgendeinem der Ziele (Dijkstra). Liefert die Kacheln ab dem ersten Schritt
 * bis einschließlich Ziel; [] wenn der Start schon ein Ziel ist; null wenn kein Ziel erreichbar ist.
 */
export function findPath(
  g: Grid,
  blocked: ReadonlySet<number>,
  from: Tile,
  targets: readonly Tile[],
  moves: readonly Movement[],
): Tile[] | null {
  const goal = new Set(targets.map((t) => key(g, t)));
  const start = key(g, from);
  if (goal.has(start)) return [];
  const dist = new Map<number, number>([[start, 0]]);
  const prev = new Map<number, number>();
  const open: Array<[number, number]> = [[0, start]];
  const done = new Set<number>();
  while (open.length > 0) {
    // Kleine Raster: lineare Suche nach dem kleinsten Abstand genügt.
    let best = 0;
    for (let i = 1; i < open.length; i++) if (open[i]![0] < open[best]![0]) best = i;
    const [d, k] = open.splice(best, 1)[0]!;
    if (done.has(k)) continue;
    done.add(k);
    if (goal.has(k)) {
      const path: Tile[] = [];
      let cur: number | undefined = k;
      while (cur !== undefined && cur !== start) {
        path.unshift(tileOf(g, cur));
        cur = prev.get(cur);
      }
      return path;
    }
    for (const { tile, cost } of neighbors(g, blocked, tileOf(g, k), moves)) {
      const nk = key(g, tile);
      const nd = d + cost;
      if (nd < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, nd);
        prev.set(nk, k);
        open.push([nd, nk]);
      }
    }
  }
  return null;
}

/** Alle Kacheln, die von `from` aus erreichbar sind. */
export function reachableSet(
  g: Grid,
  blocked: ReadonlySet<number>,
  from: Tile,
  moves: readonly Movement[],
): Set<number> {
  const seen = new Set<number>();
  if (!passable(g, blocked, from, moves)) return seen;
  const queue = [from];
  seen.add(key(g, from));
  while (queue.length > 0) {
    const t = queue.shift()!;
    for (const { tile } of neighbors(g, blocked, t, moves)) {
      const k = key(g, tile);
      if (!seen.has(k)) {
        seen.add(k);
        queue.push(tile);
      }
    }
  }
  return seen;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectTiles(r: Rect): Tile[] {
  const out: Tile[] = [];
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) out.push({ x, y });
  return out;
}

/** Kacheln, von denen aus man mit etwas in diesem Rechteck interagieren kann (Ring drumherum, optional inkl. Fläche). */
export function accessTiles(
  g: Grid,
  blocked: ReadonlySet<number>,
  r: Rect,
  moves: readonly Movement[],
  includeInside: boolean,
): Tile[] {
  const out: Tile[] = [];
  for (let y = r.y - 1; y <= r.y + r.h; y++) {
    for (let x = r.x - 1; x <= r.x + r.w; x++) {
      const inside = x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
      if (inside && !includeInside) continue;
      const t = { x, y };
      if (passable(g, blocked, t, moves)) out.push(t);
    }
  }
  return out;
}

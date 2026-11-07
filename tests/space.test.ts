import { describe, expect, it } from 'vitest';
import { content, fresh } from './helpers';
import { movementBlocked } from '../src/game/occupancy';
import { findPath, gridFor, reachableSet, key } from '../src/game/space';

const map = content.maps['map.startufer']!;
const g = gridFor(map);
const blocked = movementBlocked(fresh(), map);

describe('Wege', () => {
  it('der Steg ist vom Bau aus zu Fuß erreichbar', () => {
    const path = findPath(g, blocked, map.arrival, [{ x: 10, y: 8 }], ['land']);
    expect(path).not.toBeNull();
    expect(path!.at(-1)).toEqual({ x: 10, y: 8 });
  });

  it('das treibende Holz erreicht nur, wer schwimmen kann', () => {
    const target = [{ x: 6, y: 11 }];
    expect(findPath(g, blocked, map.arrival, target, ['land'])).toBeNull();
    expect(findPath(g, blocked, map.arrival, target, ['land', 'water'])).not.toBeNull();
  });

  it('niemand läuft durch Bau oder Werkbank', () => {
    const onFoot = reachableSet(g, blocked, map.arrival, ['land']);
    expect(onFoot.has(key(g, { x: 3, y: 23 }))).toBe(false);
    expect(onFoot.has(key(g, { x: 11, y: 24 }))).toBe(false);
  });

  it('keine Abkürzung diagonal über Ecken', () => {
    // Von (9,16) nach (10,15): diagonal, aber (9,15) ist Wasser -> zu Fuß nur über (10,16)
    const path = findPath(g, blocked, { x: 9, y: 16 }, [{ x: 10, y: 15 }], ['land']);
    expect(path).toEqual([{ x: 10, y: 16 }, { x: 10, y: 15 }]);
  });
});

// Fundstellen: einmalig oder nachwachsend. Die Uhrzeit kommt immer von außen (Aktion bzw. Aufrufer).
import type { GatherSpotDef, MapDef } from '../../content/types';
import type { GameState } from '../types';
import { matches } from '../conditions';

export const spotKey = (mapId: string, spotId: string): string => `${mapId}/${spotId}`;

/** Liegt hier gerade etwas zum Aufheben? */
export function spotReady(s: GameState, map: MapDef, spot: GatherSpotDef, now: number): boolean {
  if (!matches(spot.availableWhen, s)) return false;
  const k = spotKey(map.id, spot.id);
  if (!spot.regrowMinutes) return !s.gathered.includes(k);
  const until = s.regrow[k] ?? 0;
  // Liegt der Zeitpunkt weiter in der Zukunft als die ganze Wachszeit, wurde die Geräteuhr zurückgestellt: dann gleich wieder da.
  return until <= now || until - now > spot.regrowMinutes * 60_000;
}

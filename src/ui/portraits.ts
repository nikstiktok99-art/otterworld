import { spriteDef } from '../assets/catalog';
import { placeholderCanvas } from '../assets/placeholders';

const cache = new Map<string, string>();

/** Bildquelle für ein Porträt: gelieferte Datei oder gezeichneter Platzhalter. */
export function portraitSrc(key: string | undefined): string | null {
  if (!key) return null;
  const hit = cache.get(key);
  if (hit) return hit;
  const def = spriteDef(key);
  if (!def) return null;
  const src = def.file ? def.file.path : placeholderCanvas(def).toDataURL();
  cache.set(key, src);
  return src;
}

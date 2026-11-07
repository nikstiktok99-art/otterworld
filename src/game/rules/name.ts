export const NAME_MAX = 16;

/**
 * Bereinigt einen eingegebenen Namen. Erlaubt: Buchstaben (inkl. Umlaute und Akzente), Ziffern,
 * Leerzeichen, Bindestrich, Apostroph. 1–16 Zeichen. Liefert null, wenn der Name nicht gültig ist.
 */
export function cleanName(raw: string): string | null {
  const name = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (name.length < 1 || [...name].length > NAME_MAX) return null;
  if (!/^[\p{L}\p{M}0-9 '’\-]+$/u.test(name)) return null;
  if (!/[\p{L}0-9]/u.test(name)) return null;
  return name;
}

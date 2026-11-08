// Uhr für nachwachsende Fundstellen. Die Spielregeln lesen nie selbst eine Uhr – Welt und Oberfläche geben die
// Zeit mit der Aktion mit. Automatische Tests können die Uhr vorstellen (siehe testHooks).
export const clock = {
  offsetMs: 0,
  now(): number {
    return Date.now() + this.offsetMs;
  },
};

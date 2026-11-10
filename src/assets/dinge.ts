// Gegenstände ohne eigenen Codex-Entwurf, im Stil der Codex-Grafiken gezeichnet: warmes Holz mit heller Oberkante,
// rosa-graue Steine wie die Ufersteine im Boden, dunkle warme Kontur, Licht von oben links.
import { ell, figure, KONTUR, px } from './freunde';

type C = CanvasRenderingContext2D;
const SCHATTEN = 'rgba(40, 30, 20, 0.22)';
const HOLZ = { hell: '#f2a964', mittel: '#d68a50', dunkel: '#a85f38', kontur: '#5a3422' };

/** Wegweiser: Holzpfosten mit Schild, Spitze nach rechts (das Spiel spiegelt für links). Frame 16 × 32, Anker (8, 31). */
export function paintWegweiser(c: C) {
  ell(c, 8, 31, 5, 1.4, SCHATTEN);
  // Pfosten
  px(c, 6, 10, HOLZ.kontur, 4, 22);
  px(c, 7, 10, HOLZ.mittel, 2, 21);
  px(c, 7, 10, HOLZ.hell, 1, 21);
  // Schild mit Spitze
  px(c, 0, 4, HOLZ.kontur, 13, 9);
  px(c, 13, 5, HOLZ.kontur, 1, 7);
  px(c, 14, 6, HOLZ.kontur, 1, 5);
  px(c, 15, 7, HOLZ.kontur, 1, 3);
  px(c, 1, 5, HOLZ.mittel, 12, 7);
  px(c, 13, 6, HOLZ.mittel, 1, 5);
  px(c, 14, 7, HOLZ.mittel, 1, 3);
  px(c, 1, 5, HOLZ.hell, 12, 1);
  px(c, 1, 11, HOLZ.dunkel, 13, 1);
  // Maserung und Nagel
  px(c, 3, 7, HOLZ.dunkel, 6, 1);
  px(c, 4, 9, HOLZ.dunkel, 5, 1);
  px(c, 11, 8, '#e9c76a');
  // Grasbüschel am Fuß
  px(c, 4, 29, '#6a873f', 1, 2);
  px(c, 5, 28, '#6a873f', 1, 3);
  px(c, 10, 28, '#6a873f', 1, 3);
  px(c, 11, 29, '#4c6b3b', 1, 2);
}

/** Sprechblase aus Papier mit drei Punkten über einer Figur. Frame 12 × 12, Anker (6, 11). */
export function paintHinweis(c: C) {
  const rows = ['.oooooooooo.', 'oppppppppppo', 'oppkppkppkpo', 'oppppppppppo', '.ooopoooooo.', '...opo......', '...oo.......'];
  const cols: Record<string, string> = { o: KONTUR, p: '#fff5df', k: '#566b44' };
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== '.') px(c, x, y + 4, cols[ch]!);
    }),
  );
  px(c, 1, 5, '#ffffff', 2, 1);
}

const STEIN = { col: '#b48a80', shade: '#977074', hi: '#dcae8f' };

/** Meerkats Aussichtsstein (32 × 24, Anker 16, 23); mit Federwimpel und später mit Sonnenblume im Topf. */
export function paintAussichtsstein(c: C, wimpel: boolean, blume = false) {
  ell(c, 16, 22.5, 14, 1.6, SCHATTEN);
  figure(c, [
    { x: 9, y: 19, rx: 6, ry: 3.5, ...STEIN },
    { x: 17, y: 16.5, rx: 11, ry: 5.5, ...STEIN },
  ]);
  ell(c, 12, 13.5, 4, 1.2, '#ecc6a6');
  px(c, 22, 19, '#806670', 3, 1);
  px(c, 6, 20, '#806670', 2, 1);
  if (wimpel) {
    // Treibholzstab mit Wimpel und zwei Federn
    px(c, 21, 0, HOLZ.kontur, 3, 13);
    px(c, 22, 1, HOLZ.mittel, 1, 12);
    figure(c, [{ x: 26, y: 3, rx: 3.6, ry: 2, col: '#ec8aa2', shade: '#cf6683' }]);
    px(c, 24, 4, '#f4d264', 5, 1);
    px(c, 18, 4, '#5b8fd6', 2, 4);
    px(c, 17, 5, '#a2d2ef', 1, 3);
  }
  if (blume) {
    // kleine Sonnenblume in einer Muschel links neben dem Stein
    figure(c, [{ x: 4, y: 20.5, rx: 3.4, ry: 2, col: '#f6c7c0', shade: '#d99c98' }]);
    px(c, 4, 9, '#5f7c3e', 1, 10);
    px(c, 2, 14, '#6a873f', 2, 1);
    figure(c, [{ x: 4.5, y: 7, rx: 3.6, ry: 3.6, col: '#f4c542', shade: '#d99a2c' }]);
    ell(c, 4.5, 7, 1.5, 1.5, '#7a4a2a');
  }
}

/** Bunte Feder im Gras (16 × 16, Anker 8, 13). */
export function paintFeder(c: C) {
  ell(c, 8, 14, 5, 1, SCHATTEN);
  for (let i = 0; i < 8; i++) {
    const x = 4 + i;
    const y = 12 - i;
    px(c, x - 1, y - 1, KONTUR, 3, 3);
  }
  for (let i = 0; i < 8; i++) {
    const x = 4 + i;
    const y = 12 - i;
    px(c, x, y - 1, i < 3 ? '#7fb6e6' : i < 6 ? '#5b8fd6' : '#a2d2ef', 1, 2);
    px(c, x - 1, y, i % 2 ? '#a2d2ef' : '#7fb6e6');
  }
  for (let i = 1; i < 8; i++) px(c, 4 + i, 13 - i, '#f2a65a');
  px(c, 3, 13, HOLZ.kontur);
}

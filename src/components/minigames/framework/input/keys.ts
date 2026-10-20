// Tastatur am Rechner (Auftrag 40), ohne React: welche Tasten welche Richtung meinen.

const LEFT = ['ArrowLeft', 'a', 'A'];
const RIGHT = ['ArrowRight', 'd', 'D'];

/** Richtung aus den gerade gehaltenen Tasten. Die zuletzt gedrückte gewinnt, wie beim Tippen. */
export function axisFromKeys(held: readonly string[]): -1 | 0 | 1 {
  for (let i = held.length - 1; i >= 0; i -= 1) {
    if (LEFT.includes(held[i])) return -1;
    if (RIGHT.includes(held[i])) return 1;
  }
  return 0;
}

/** Ist das eine Richtungstaste (dann scrollt die Seite nicht mit)? */
export function isAxisKey(key: string): boolean {
  return LEFT.includes(key) || RIGHT.includes(key);
}

/** Taste "1" bis "9" als Index 0 bis 8, sonst -1 (Quiz-Antworten). */
export function digitIndex(key: string): number {
  if (key.length !== 1 || key < '1' || key > '9') return -1;
  return key.charCodeAt(0) - '1'.charCodeAt(0);
}

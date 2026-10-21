// Farb- und Formhilfen für die Icons (ART-2), ohne React, damit testbar.

const hex2 = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');

function parse(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Mischt `a` und `b` im Verhältnis `t` (0 = nur a, 1 = nur b). Erwartet #RRGGBB. */
export function mix(a: string, b: string, t: number): string {
  const k = Math.min(1, Math.max(0, t));
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return `#${hex2(ar + (br - ar) * k)}${hex2(ag + (bg - ag) * k)}${hex2(ab + (bb - ab) * k)}`.toUpperCase();
}

/** Heller Richtung Weiß. */
export const lighten = (hex: string, t: number) => mix(hex, '#FFFFFF', t);

/** Dunkler Richtung Schwarz, leicht warm, damit Schatten nicht grau wirken. */
export const darken = (hex: string, t: number) => mix(hex, '#2A1A10', t);

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Umriss-Rechteck eines SVG-Pfads aus absoluten Befehlen (M, L, Q, C, Z), wie ihn die Icons
 * verwenden: Zahlen wechseln zwischen x und y. Kontrollpunkte zählen mit, das reicht für Verläufe.
 */
export function pathBounds(d: string): Bounds {
  const nums = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  if (nums.length < 2) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    minX = Math.min(minX, nums[i]);
    maxX = Math.max(maxX, nums[i]);
    minY = Math.min(minY, nums[i + 1]);
    maxY = Math.max(maxY, nums[i + 1]);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

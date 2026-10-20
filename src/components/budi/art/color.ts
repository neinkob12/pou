// Farbmischung für die Sorten-Varianten ohne eigene Grafik (Farbschleier, B9). Reines TypeScript.

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

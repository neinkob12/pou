// Stern-Form für Icons und Grafik, ohne React, damit testbar.

/** Fünfzackiger Stern als SVG-Pfad um (cx, cy), Spitze oben. `inner` = Innenradius / Außenradius. */
export function starPath(cx: number, cy: number, r: number, inner = 0.48): string {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * inner : r;
    return `${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`;
  });
  return `M${pts.join(' L')} Z`;
}

// Hochzählen einer Zahl im Ergebnis (Auftrag 51), ohne React: Wert nach `elapsedMs` von `durationMs`,
// weich auslaufend (easeOutCubic), immer ganzzahlig und am Ende genau `target`.

export function countUpValue(target: number, elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0 || elapsedMs >= durationMs) return target;
  if (elapsedMs <= 0) return 0;
  const t = elapsedMs / durationMs;
  const eased = 1 - (1 - t) ** 3;
  return Math.round(target * eased);
}

// Bewegungskurven der Minigame-Grafik (Auftrag 51): Überschwingen, Federn, weiches Auslaufen.
// Reine Worklets ohne React, damit sie testbar bleiben.

/** Überschwingen (easeOutBack): 0 bei t=0, 1 bei t=1, dazwischen kurz über 1. */
export function popIn(t: number): number {
  'worklet';
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const s = 2.2;
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
}

/** Gedämpftes Nachfedern um 1 nach einem Stoß: Ausschlag `amount`, ausgeklungen nach `ms`. */
export function springBack(ageMs: number, ms: number, amount: number): number {
  'worklet';
  if (ageMs < 0 || ageMs >= ms) return 1;
  const t = ageMs / ms;
  return 1 + amount * Math.cos(t * Math.PI * 3) * (1 - t) * (1 - t);
}

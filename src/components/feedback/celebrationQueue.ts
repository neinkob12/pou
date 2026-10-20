// Warteschlange der Feiern im Zimmer (WEB-3). Rein, damit testbar.

import type { PhaseId } from '../../game/config';

export type Celebration = { kind: 'phase'; phase: PhaseId } | { kind: 'chest'; coins: number };

/**
 * Neue Feier anhängen. Mehrere Phasenwechsel auf einmal (App war lange zu) zeigen nur den letzten:
 * eine wartende Phasen-Feier wird ersetzt, die gerade sichtbare (Index 0) bleibt stehen.
 */
export function enqueueCelebration(queue: readonly Celebration[], next: Celebration): Celebration[] {
  if (next.kind === 'phase') {
    const waiting = queue.findIndex((c, i) => i > 0 && c.kind === 'phase');
    if (waiting > 0) return queue.map((c, i) => (i === waiting ? next : c));
    if (queue.length === 1 && queue[0].kind === 'phase') return [next];
  }
  return [...queue, next];
}

/** Sichtbare Feier schließen. */
export function dismissCelebration(queue: readonly Celebration[]): Celebration[] {
  return queue.slice(1);
}

// Reine Logik für usePhaseWatcher: Welche Phasenwechsel sind seit dem letzten Blick passiert?

import type { PhaseId } from '../../../game/config';

/** Reihenfolge der Phasen im Leben einer Pflanze. */
export const PHASE_ORDER: readonly PhaseId[] = [
  'germination',
  'seedling',
  'vegetative',
  'flowering',
  'ready',
  'drying',
  'done',
];

/** Zuletzt gesehene Phase, je Pflanze (erkannt am Pflanzzeitpunkt). */
export interface SeenPhase {
  plantedAtMs: number;
  phase: PhaseId;
}

export interface PhaseTransition {
  from: PhaseId;
  to: PhaseId;
}

/**
 * Alle Schritte von der zuletzt gesehenen zur aktuellen Phase, auch übersprungene
 * (App war tagelang zu). Neue Pflanze oder Rückschritt: keine Wechsel.
 */
export function phaseTransitions(seen: SeenPhase | null, plantedAtMs: number, current: PhaseId): PhaseTransition[] {
  if (!seen || seen.plantedAtMs !== plantedAtMs) return [];
  const from = PHASE_ORDER.indexOf(seen.phase);
  const to = PHASE_ORDER.indexOf(current);
  if (from < 0 || to <= from) return [];
  const steps: PhaseTransition[] = [];
  for (let i = from; i < to; i++) steps.push({ from: PHASE_ORDER[i], to: PHASE_ORDER[i + 1] });
  return steps;
}

/** Liest einen gespeicherten SeenPhase-Wert. Kaputt oder fehlend: null. */
export function parseSeenPhase(raw: string | undefined): SeenPhase | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const { plantedAtMs, phase } = value as Record<string, unknown>;
    if (typeof plantedAtMs !== 'number' || typeof phase !== 'string') return null;
    if (!PHASE_ORDER.includes(phase as PhaseId)) return null;
    return { plantedAtMs, phase: phase as PhaseId };
  } catch {
    return null;
  }
}

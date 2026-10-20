import { useEffect } from 'react';

import type { PhaseId } from '../game/config';
import { gameEvents } from '../game/events';
import { safeSet, storage } from '../lib/storage';
import { parseSeenPhase, phaseTransitions } from '../components/room/phase/phaseWatch';
import { clock } from '../lib/clock';

/** Eigener MMKV-Schlüssel, damit Phasenwechsel auch nach Tagen im Hintergrund erkannt werden. */
export const PHASE_SEEN_KEY = 'potpou-phase-seen';

/**
 * Vergleicht die aktuelle Phase mit der zuletzt gesehenen und löst für jeden Schritt
 * `phaseChanged` aus: beim Öffnen der App und jedes Mal, wenn sich die Phase im Vordergrund ändert.
 * Die Phase kommt aus getPlantStatus (Aufrufer), hier wird nichts gezählt.
 */
export function usePhaseWatcher(plantedAtMs: number | null, phase: PhaseId | null): void {
  useEffect(() => {
    if (plantedAtMs === null || phase === null) return;
    const seen = parseSeenPhase(storage.getString(PHASE_SEEN_KEY));
    const steps = phaseTransitions(seen, plantedAtMs, phase);
    safeSet(PHASE_SEEN_KEY, JSON.stringify({ plantedAtMs, phase }));
    const atMs = clock.now();
    for (const step of steps) gameEvents.emit('phaseChanged', { ...step, atMs });
  }, [plantedAtMs, phase]);
}

import { useEffect } from 'react';

import { gameEvents } from '../../game/events';
import { getPlantStatus } from '../../game/timeEngine';
import { useGameStore } from '../../store/gameStore';
import { useNow } from '../room/useNow';

/**
 * Schaltet Fakten-Karten frei: bei jedem `phaseChanged` (P11) und zusätzlich aus der aktuellen
 * Phase der Pflanze. Der zweite Weg holt Karten nach, wenn das Ereignis verpasst wurde (oder im
 * Debug-Menü vorgespult wird). Beides ist idempotent.
 */
export function useFactUnlocks() {
  const unlock = useGameStore((s) => s.unlockFactsForPhase);
  const plant = useGameStore((s) => s.plant);
  const now = useNow();
  const phase = plant ? getPlantStatus(plant, now).phase : null;

  useEffect(() => gameEvents.on('phaseChanged', ({ to }) => unlock(to)), [unlock]);

  useEffect(() => {
    if (phase) unlock(phase);
  }, [phase, unlock]);
}

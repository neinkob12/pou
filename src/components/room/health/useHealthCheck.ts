// Ruft checkHealth (P05) regelmäßig auf: beim Öffnen, bei Rückkehr in den Vordergrund und,
// solange der Raum offen ist, mit jeder Minute aus useNow. Gewürfelt wird trotzdem nur je
// abgeschlossenem Fenster seit dem letzten Check, mehr Aufrufe ändern das Ergebnis nicht.

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useGameStore } from '../../../store/gameStore';
import { useNow } from '../useNow';
import { syncHealth } from './healthLogic';

export function useHealthCheck(): void {
  const now = useNow();
  const plantedAtMs = useGameStore((s) => s.plant?.plantedAtMs ?? null);
  const hydrated = useGameStore((s) => s.hydration !== 'pending');

  // `now` tickt jede Minute und löst den Check aus; gerechnet wird mit der echten Uhrzeit.
  useEffect(() => {
    if (hydrated && plantedAtMs !== null) syncHealth(useGameStore.getState(), Math.max(now, Date.now()));
  }, [hydrated, now, plantedAtMs]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncHealth(useGameStore.getState(), Date.now());
    });
    return () => sub.remove();
  }, []);
}

/** Einhängepunkt für RoomScreen: hält die Gesundheit aktuell, zeichnet nichts. */
export function HealthWatch() {
  useHealthCheck();
  return null;
}

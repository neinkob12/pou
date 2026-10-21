import { useEffect } from 'react';

import { levelForXp } from '../../game/progression';
import { useGameStore } from '../../store/gameStore';
import { levelReached } from './rewardFx';

/**
 * Meldet einen Level-Aufstieg (ART-5), sobald die Erfahrung im Spielstand ein neues Level erreicht.
 * Während der Spielstand lädt, zählt der geladene Stand als Ausgangspunkt, nicht als Aufstieg.
 */
export function useLevelUps(onLevel: (level: number) => void) {
  useEffect(() => {
    let last = levelForXp(useGameStore.getState().xp);
    return useGameStore.subscribe((s, prev) => {
      if (s.xp === prev.xp) return;
      const level = levelForXp(s.xp);
      const reached = s.hydration === 'pending' || prev.hydration === 'pending' ? null : levelReached(last, level);
      last = level;
      if (reached !== null) onLevel(reached);
    });
  }, [onLevel]);
}

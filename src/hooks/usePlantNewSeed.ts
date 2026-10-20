import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import type { StrainId } from '../game/config';
import { useGameStore } from '../store/gameStore';

/** Pflanzt einen neuen Samen, setzt Bedürfnisse und Gesundheit zurück und geht ins Zimmer (P16). */
export function usePlantNewSeed(): (strainId: StrainId) => void {
  const router = useRouter();
  return useCallback(
    (strainId) => {
      const nowMs = Date.now();
      const s = useGameStore.getState();
      s.plantSeed(strainId, nowMs);
      s.resetNeeds(nowMs);
      s.resetHealth(nowMs);
      router.replace('/');
    },
    [router],
  );
}

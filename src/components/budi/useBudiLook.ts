import { useEffect, useMemo, useState } from 'react';
import { useAnimatedReaction, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { Condition } from '../../game/needs';
import { getPlantStatus } from '../../game/timeEngine';
import { budi, type BudiVariantId } from '../../lib/assets';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';
import type { CareReaction } from '../room/care/CareStage';
import { useNow } from '../../hooks/useNow';
import { computeBudiLook, type BudiLook, type BudiReaction } from './budiLook';

/** So lange zeigt Budi nach einer Pflege das Reaktionsgesicht. */
const REACTION_FACE_MS = 1600;

const hasAsset = (key: BudiVariantId) => budi[key] !== undefined;

/** Letzte Reaktion, nur kurz nach der Pflege. Danach wieder das Zustandsgesicht. */
function useFreshReaction(reaction: CareReaction | null): BudiReaction | null {
  const [expiredId, setExpiredId] = useState(0);
  useEffect(() => {
    if (!reaction) return;
    const id = setTimeout(() => setExpiredId(reaction.id), REACTION_FACE_MS);
    return () => clearTimeout(id);
  }, [reaction]);
  return reaction && reaction.id !== expiredId ? reaction : null;
}

/** Schwebe-Zustand aus dem UI-Thread als React-Zustand (für das überraschte Gesicht). */
function useHoveringFlag(hovering: SharedValue<number>): boolean {
  const [flag, setFlag] = useState(false);
  useAnimatedReaction(
    () => hovering.get() === 1,
    (now, prev) => {
      if (now !== prev) scheduleOnRN(setFlag, now);
    },
  );
  return flag;
}

/** Welche Ebenen Budi gerade zeigt: Phase und Sorte aus dem Store, Gesicht aus dem Zustand. */
export function useBudiLook(
  condition: Condition | null,
  reaction: CareReaction | null,
  hovering: SharedValue<number>,
): BudiLook {
  const plant = useGameStore((s) => s.plant);
  const debugMultiplier = useGameStore(selectDebugMultiplier);
  const now = useNow();
  const fresh = useFreshReaction(reaction);
  const hoverFlag = useHoveringFlag(hovering);

  return useMemo(() => {
    const status = plant ? getPlantStatus(plant, now, debugMultiplier) : null;
    return computeBudiLook(
      {
        phase: status?.phase ?? null,
        phaseProgress: status?.phaseProgress ?? 0,
        strainId: plant?.strainId ?? null,
        condition,
        reaction: fresh,
        hovering: hoverFlag,
      },
      hasAsset,
    );
  }, [plant, now, debugMultiplier, condition, fresh, hoverFlag]);
}

import { useEffect, useMemo, useState } from 'react';
import { useAnimatedReaction, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { Condition } from '../../game/needs';
import { getPlantStatus } from '../../game/timeEngine';
import { budi, type BudiVariantId } from '../../lib/assets';
import { clock } from '../../lib/clock';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';
import type { CareReaction } from '../room/care/CareStage';
import { getLightState, isAutoflower } from '../room/phase/lightCycle';
import { usePlantClock } from '../room/phase/usePlantClock';
import { computeBudiLook, isRipe, LOVE_STREAK, TICKLE_STREAK, type BudiLook, type BudiReaction } from './budiLook';
import { nextPetStreak, reactionMotionFor, sleepTransition, type PetStreak, type ReactionMotion, type SleepTransition } from './budiMood';

/** So lange zeigt Budi nach einer Pflege das Reaktionsgesicht. */
const REACTION_FACE_MS = 1600;
/** So lange gähnt Budi beim Einschlafen und Aufwachen. */
const DROWSY_MS = 1800;

const hasAsset = (key: BudiVariantId) => budi[key] !== undefined;

interface Counted {
  id: number;
  streak: PetStreak | null;
}

/**
 * Letzte Reaktion, nur kurz nach der Pflege. Danach wieder das Zustandsgesicht.
 * Zählt Streichler kurz hintereinander mit (Kitzeln, Verliebt).
 */
function useFreshReaction(reaction: CareReaction | null): (BudiReaction & { id: number }) | null {
  const [expiredId, setExpiredId] = useState(0);
  const [counted, setCounted] = useState<Counted>({ id: 0, streak: null });
  // Neue Reaktion: Serie im Rendern fortschreiben (abgeleiteter Zustand, kein Effekt nötig).
  if (reaction && reaction.id !== counted.id) {
    const pet = reaction.type === 'pet' && reaction.feedback === 'success';
    setCounted({ id: reaction.id, streak: pet ? nextPetStreak(counted.streak, clock.now()) : null });
  }
  useEffect(() => {
    if (!reaction) return;
    const id = setTimeout(() => setExpiredId(reaction.id), REACTION_FACE_MS);
    return () => clearTimeout(id);
  }, [reaction]);
  const live = reaction && reaction.id !== expiredId ? reaction : null;
  const streak = live && counted.id === live.id ? counted.streak?.count : undefined;
  return useMemo(() => (live ? { ...live, streak } : null), [live, streak]);
}

interface SleepState {
  sleeping: boolean;
  transition: SleepTransition | null;
  id: number;
  drowsy: boolean;
}

/** Wechsel zwischen Schlafen und Wachen: kurz gähnen, Budi streckt sich oder sackt weg. */
function useSleepTransition(sleeping: boolean): SleepState {
  const [state, setState] = useState<SleepState>({ sleeping, transition: null, id: 0, drowsy: false });
  if (state.sleeping !== sleeping) {
    setState({ sleeping, transition: sleepTransition(state.sleeping, sleeping), id: state.id + 1, drowsy: true });
  }
  useEffect(() => {
    if (!state.drowsy) return;
    const id = setTimeout(() => setState((s) => ({ ...s, drowsy: false })), DROWSY_MS);
    return () => clearTimeout(id);
  }, [state.drowsy, state.id]);
  return state;
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
export interface BudiLookState extends BudiLook {
  ripe: boolean;
  /** Bewegung zur letzten Pflege, `id` wechselt mit jeder Pflege. */
  motion: { kind: ReactionMotion; id: number } | null;
  /** Letzter Wechsel zwischen Schlafen und Wachen. */
  sleep: { kind: SleepTransition; id: number } | null;
}

export function useBudiLook(
  condition: Condition | null,
  reaction: CareReaction | null,
  hovering: SharedValue<number>,
): BudiLookState {
  const plant = useGameStore((s) => s.plant);
  const debugMultiplier = useGameStore(selectDebugMultiplier);
  // Gleicher Takt wie Lampe und Zimmer, damit Budi mit dem Licht aufwacht (auch im Zeitraffer).
  const now = usePlantClock(debugMultiplier);
  const fresh = useFreshReaction(reaction);
  const hoverFlag = useHoveringFlag(hovering);

  const status = useMemo(() => (plant ? getPlantStatus(plant, now, debugMultiplier) : null), [plant, now, debugMultiplier]);
  const isNight = status && plant ? !getLightState(status, isAutoflower(plant.strainId)).isDay : false;
  const growing = status !== null && status.phase !== 'drying' && status.phase !== 'done';
  const sleep = useSleepTransition(growing && isNight && (condition ?? 'ok') === 'ok');

  return useMemo(() => {
    const look = computeBudiLook(
      {
        phase: status?.phase ?? null,
        phaseProgress: status?.phaseProgress ?? 0,
        strainId: plant?.strainId ?? null,
        condition,
        reaction: fresh,
        hovering: hoverFlag,
        isNight,
        drowsy: sleep.drowsy,
      },
      hasAsset,
    );
    const kind = reactionMotionFor(fresh, TICKLE_STREAK, LOVE_STREAK);
    return {
      ...look,
      ripe: isRipe(status?.phase ?? null),
      motion: kind && fresh ? { kind, id: fresh.id } : null,
      sleep: sleep.transition ? { kind: sleep.transition, id: sleep.id } : null,
    };
  }, [plant, status, isNight, condition, fresh, hoverFlag, sleep]);
}

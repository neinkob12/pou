// Bedürfnisse für den Raum: aktueller Stand aus Zeitstempeln und Pflege-Aktionen.
// Jede Aktion geht über den Needs-Slice, der applyCare aus src/game/needs.ts aufruft.

import { useCallback, useMemo } from 'react';

import type { CareActionId } from '../game/events';
import { getPlantStatus } from '../game/timeEngine';
import {
  careFeedback,
  computeCareView,
  isDarkDisturbPhase,
  moodBonusAction,
  type CareFeedback,
  type CareView,
} from '../components/room/care/careLogic';
import { playCareHaptic } from '../components/room/care/haptics';
import { useNow } from './useNow';
import { useGameStore } from '../store/gameStore';
import { selectDebugMultiplier } from '../store/slices/debug';
import { selectUpgradeEffects } from '../store/slices/shop';
import { clock } from '../lib/clock';

/**
 * Pflege jetzt anwenden, mit der Phase zu diesem Zeitpunkt. Ohne Pflanze passiert nichts.
 * Rückgabe: Rückmeldung für Haptik und Animation, null ohne Pflanze.
 */
export function applyCareNow(type: CareActionId, amount?: number): CareFeedback | null {
  const nowMs = clock.now();
  const state = useGameStore.getState();
  if (!state.plant) return null;
  const { phase } = getPlantStatus(state.plant, nowMs, selectDebugMultiplier(state));
  const before = state.needs;
  const applied = state.care({ type, phase, amount }, nowMs, selectUpgradeEffects(state).needModifiers);
  return careFeedback(before, useGameStore.getState().needs, applied);
}

/** Laune-Bonus nach einem Minispiel (MINIGAME_REWARDS.moodPerRound), über applyCare. */
export function applyMinigameMoodBonus(): void {
  const nowMs = clock.now();
  const state = useGameStore.getState();
  const phase = state.plant ? getPlantStatus(state.plant, nowMs, selectDebugMultiplier(state)).phase : null;
  const action = moodBonusAction(phase);
  if (action) state.care(action, nowMs, selectUpgradeEffects(state).needModifiers);
}

/**
 * Dunkelphase gestört (Ereignis lightDisturbed, P11): Laune sinkt über disturbMood, nur in der Blüte.
 * Rückgabe: ob es gewirkt hat (nicht ohne Pflanze, außerhalb der Blüte oder im Koma).
 */
export function applyLightDisturbance(nowMs: number = clock.now()): boolean {
  const state = useGameStore.getState();
  if (!state.plant) return false;
  const { phase } = getPlantStatus(state.plant, nowMs, selectDebugMultiplier(state));
  if (!isDarkDisturbPhase(phase)) return false;
  return state.disturbMood(phase, nowMs);
}

export interface UseNeeds extends CareView {
  /** Pflege mit Haptik. Rückgabe wie applyCareNow. */
  care: (type: CareActionId) => CareFeedback | null;
}

export function useNeeds(): UseNeeds {
  const plant = useGameStore((s) => s.plant);
  const needs = useGameStore((s) => s.needs);
  const debugMultiplier = useGameStore(selectDebugMultiplier);
  const upgrades = useGameStore((s) => s.upgrades);
  const now = useNow();
  // Nach einer Pflege ist updatedAtMs neuer als `now`; computeNeeds rechnet dann ohne Abfall.
  const view = useMemo(
    () => computeCareView(plant, needs, now, debugMultiplier, selectUpgradeEffects({ upgrades }).needModifiers),
    [plant, needs, now, debugMultiplier, upgrades],
  );

  const care = useCallback((type: CareActionId) => {
    const feedback = applyCareNow(type);
    if (feedback) playCareHaptic(feedback);
    return feedback;
  }, []);

  return { ...view, care };
}

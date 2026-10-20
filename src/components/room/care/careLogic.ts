// Pflege im Raum ohne React, damit testbar: Phase und Balkenstand aus Zeitstempeln,
// Rückmeldung (Haptik) nach einer Pflege, Treffer-Test für die Ziehgesten.
// Die Spielregeln selbst stehen in src/game/needs.ts (applyCare); hier wird nur verdrahtet.

import { MINIGAME_REWARDS, type PhaseId } from '../../../game/config';
import type { CareActionId } from '../../../game/events';
import {
  computeNeeds,
  deriveCondition,
  NO_MODIFIERS,
  type CareAction,
  type Condition,
  type NeedModifiers,
  type NeedsSnapshot,
  type NeedsState,
} from '../../../game/needs';
import { getPlantStatus, type PlantRecord } from '../../../game/timeEngine';
import { PLACEHOLDER_NEED_VALUES, type NeedBarValues } from '../needBars';

/** Werkzeuge im Fach unter Budi. Streicheln ist eine Geste direkt auf Budi. */
export type CareTool = Extract<CareActionId, 'water' | 'fertilizeGrow' | 'fertilizeBloom'>;
export const CARE_TOOLS: readonly CareTool[] = ['water', 'fertilizeGrow', 'fertilizeBloom'];

/** Phasen, in denen Budi keine Pflege mehr braucht. */
const NO_CARE_PHASES: readonly PhaseId[] = ['drying', 'done'];

export interface CareView {
  /** null = noch kein Samen gepflanzt. */
  phase: PhaseId | null;
  snapshot: NeedsSnapshot | null;
  condition: Condition | null;
  /** Darf der Spieler gerade pflegen? Nicht ohne Pflanze, nicht im Trocknen, nicht im Koma. */
  canCare: boolean;
}

export function computeCareView(
  plant: PlantRecord | null,
  needs: NeedsState,
  nowMs: number,
  debugMultiplier: number,
  modifiers: NeedModifiers = NO_MODIFIERS,
): CareView {
  if (!plant) return { phase: null, snapshot: null, condition: null, canCare: false };
  const { phase } = getPlantStatus(plant, nowMs, debugMultiplier);
  const snapshot = computeNeeds(needs, nowMs, modifiers, phase);
  const condition = deriveCondition(snapshot, phase);
  const canCare = !NO_CARE_PHASES.includes(phase) && condition !== 'coma';
  return { phase, snapshot, condition, canCare };
}

/**
 * Werte der vier Balken (0 bis 100). Ohne Pflanze leer. Licht hat noch keine Logik
 * (kommt mit P11), bis dahin bleibt der Platzhalterwert aus P03.
 */
export function needBarValues(snapshot: NeedsSnapshot | null): NeedBarValues {
  const light = PLACEHOLDER_NEED_VALUES.light;
  if (!snapshot) return { water: 0, nutrients: 0, light, mood: 0 };
  return { water: snapshot.water, nutrients: snapshot.nutrients, light, mood: snapshot.mood };
}

/** Rückmeldung nach einer Pflege: hat gewirkt, hat gewirkt aber gestresst, hat nicht gewirkt. */
export type CareFeedback = 'success' | 'warning' | 'error';

export function careFeedback(before: NeedsState, after: NeedsState, applied: boolean): CareFeedback {
  if (!applied) return 'error';
  const newStress =
    after.overwateredUntilMs !== before.overwateredUntilMs ||
    after.wrongFertilizerUntilMs !== before.wrongFertilizerUntilMs;
  return newStress ? 'warning' : 'success';
}

/** Laune-Bonus nach einem Minispiel als Pflege-Aktion. Ohne Pflanze: keiner. */
export function moodBonusAction(phase: PhaseId | null): CareAction | null {
  if (phase === null || NO_CARE_PHASES.includes(phase)) return null;
  return { type: 'pet', phase, amount: MINIGAME_REWARDS.moodPerRound };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Liegt der Punkt im Rechteck (plus Rand)? Läuft auch als Worklet im UI-Thread. */
export function isInsideRect(px: number, py: number, rect: Rect | null, slop = 0): boolean {
  'worklet';
  if (!rect) return false;
  return (
    px >= rect.x - slop &&
    px <= rect.x + rect.width + slop &&
    py >= rect.y - slop &&
    py <= rect.y + rect.height + slop
  );
}

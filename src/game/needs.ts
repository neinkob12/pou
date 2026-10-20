// PotPou Bedürfnisse: Wasser, Nährstoffe, Laune (Balken 0 bis 100).
// Wie die Zeit-Engine: Es wird nie ein Timer hochgezählt. Gespeichert sind die Werte zum
// Zeitpunkt `updatedAtMs`; der aktuelle Stand wird aus dem Zeitstempel berechnet, auch wenn
// die App tagelang zu war.

import {
  BLOOM_FERTILIZER_PHASES,
  CARE_AMOUNTS,
  COMA_AFTER_REAL_HOURS,
  COMA_REVIVE_NEED_LEVEL,
  GROW_FERTILIZER_PHASES,
  NEED_DECAY_PER_REAL_HOUR,
  NEED_MAX,
  NEED_PHASE_DECAY_FACTOR,
  NEED_START,
  NEED_THRESHOLDS,
  OVERWATER_LIMIT_BY_PHASE,
  OVERWATER_STRESS_REAL_HOURS,
  PhaseId,
  WRONG_FERTILIZER_FACTOR,
  WRONG_FERTILIZER_STRESS_REAL_HOURS,
} from './config';
import type { CareActionId } from './events';

const MS_PER_REAL_HOUR = 60 * 60 * 1000;

export type NeedId = keyof typeof NEED_DECAY_PER_REAL_HOUR;
export type NeedValues = Record<NeedId, number>;

export const NEED_IDS: readonly NeedId[] = ['water', 'nutrients', 'mood'];

/** Gespeicherter Zustand. Werte gelten zum Zeitpunkt `updatedAtMs`. */
export interface NeedsState {
  values: NeedValues;
  updatedAtMs: number;
  /** Letzte Pflege-Aktion. Grundlage für das Koma. */
  lastCareAtMs: number;
  /** Bis dahin ist Budi überwässert (null = nicht). */
  overwateredUntilMs: number | null;
  /** Bis dahin wirkt falscher Dünger nach (null = nicht). */
  wrongFertilizerUntilMs: number | null;
}

/** Abfall-Multiplikatoren je Balken, z. B. aus Shop-Upgrades (P15). 1 = normal, 0.5 = halb so schnell. */
export type NeedModifiers = Partial<Record<NeedId, number>>;
export const NO_MODIFIERS: NeedModifiers = {};

/** Berechneter Stand zu einem Zeitpunkt. Eingabe für deriveCondition. */
export interface NeedsSnapshot extends NeedValues {
  hoursSinceCare: number;
  overwatered: boolean;
  wrongFertilizer: boolean;
}

export interface CareAction {
  type: CareActionId;
  /** Phase der Pflanze im Moment der Pflege (für die Phasen-Twists). */
  phase: PhaseId;
  /** Optional abweichende Menge, z. B. aus Minigames. Standard: CARE_AMOUNTS. */
  amount?: number;
}

export type Condition = 'ok' | 'thirsty' | 'hungry' | 'stressed' | 'sick' | 'coma';

const CARE_AMOUNT_BY_ACTION: Record<CareActionId, number> = CARE_AMOUNTS;

const clamp = (v: number) => Math.min(NEED_MAX, Math.max(0, v));

export function createNeeds(nowMs: number): NeedsState {
  return {
    values: { ...NEED_START },
    updatedAtMs: nowMs,
    lastCareAtMs: nowMs,
    overwateredUntilMs: null,
    wrongFertilizerUntilMs: null,
  };
}

/**
 * Stand der Balken zu `nowMs`. Der Phasen-Faktor gilt für die ganze Spanne seit `updatedAtMs`;
 * der Store schreibt bei jeder Pflege neu, die Ungenauigkeit an Phasengrenzen ist daher klein.
 */
export function computeNeeds(
  state: NeedsState,
  nowMs: number,
  modifiers: NeedModifiers,
  phase: PhaseId,
): NeedsSnapshot {
  const hours = Math.max(0, nowMs - state.updatedAtMs) / MS_PER_REAL_HOUR;
  const phaseFactor = NEED_PHASE_DECAY_FACTOR[phase] ?? {};
  const values = {} as NeedValues;
  for (const id of NEED_IDS) {
    const rate = NEED_DECAY_PER_REAL_HOUR[id] * (phaseFactor[id] ?? 1) * (modifiers[id] ?? 1);
    values[id] = clamp(state.values[id] - rate * hours);
  }
  return {
    ...values,
    hoursSinceCare: Math.max(0, nowMs - state.lastCareAtMs) / MS_PER_REAL_HOUR,
    overwatered: state.overwateredUntilMs !== null && nowMs < state.overwateredUntilMs,
    wrongFertilizer: state.wrongFertilizerUntilMs !== null && nowMs < state.wrongFertilizerUntilMs,
  };
}

export function isInComa(state: NeedsState, nowMs: number): boolean {
  return nowMs - state.lastCareAtMs >= COMA_AFTER_REAL_HOURS * MS_PER_REAL_HOUR;
}

/** Ist der Dünger für die Phase richtig? Universaldünger passt immer. */
export function isRightFertilizer(type: CareActionId, phase: PhaseId): boolean {
  if (type === 'fertilizeGrow') return GROW_FERTILIZER_PHASES.includes(phase);
  if (type === 'fertilizeBloom') return BLOOM_FERTILIZER_PHASES.includes(phase);
  return true;
}

/**
 * Wendet eine Pflege-Aktion an und gibt einen NEUEN Zustand zurück. Im Koma ändert Pflege nichts
 * (Rückgabe ist derselbe Zustand), dafür gibt es reviveNeeds.
 */
export function applyCare(
  state: NeedsState,
  action: CareAction,
  nowMs: number,
  modifiers: NeedModifiers = NO_MODIFIERS,
): NeedsState {
  if (isInComa(state, nowMs)) return state;

  const now = computeNeeds(state, nowMs, modifiers, action.phase);
  const values: NeedValues = { water: now.water, nutrients: now.nutrients, mood: now.mood };
  let { overwateredUntilMs, wrongFertilizerUntilMs } = state;
  const amount = action.amount ?? CARE_AMOUNT_BY_ACTION[action.type];

  switch (action.type) {
    case 'water': {
      const limit = OVERWATER_LIMIT_BY_PHASE[action.phase] ?? NEED_THRESHOLDS.overwatered;
      if (values.water + amount > limit) {
        overwateredUntilMs = nowMs + OVERWATER_STRESS_REAL_HOURS * MS_PER_REAL_HOUR;
      }
      values.water = clamp(values.water + amount);
      break;
    }
    case 'fertilize':
    case 'fertilizeGrow':
    case 'fertilizeBloom': {
      const right = isRightFertilizer(action.type, action.phase);
      if (!right) {
        wrongFertilizerUntilMs = nowMs + WRONG_FERTILIZER_STRESS_REAL_HOURS * MS_PER_REAL_HOUR;
      }
      values.nutrients = clamp(values.nutrients + amount * (right ? 1 : WRONG_FERTILIZER_FACTOR));
      break;
    }
    case 'pet':
      values.mood = clamp(values.mood + amount);
      break;
  }

  return { values, updatedAtMs: nowMs, lastCareAtMs: nowMs, overwateredUntilMs, wrongFertilizerUntilMs };
}

/**
 * Senkt die Laune um `amount` (z. B. Störung der Dunkelphase). Keine Pflege: `lastCareAtMs` bleibt,
 * damit es nicht vor dem Koma schützt. Im Koma passiert nichts (Rückgabe ist derselbe Zustand).
 */
export function applyMoodPenalty(
  state: NeedsState,
  amount: number,
  phase: PhaseId,
  nowMs: number,
  modifiers: NeedModifiers = NO_MODIFIERS,
): NeedsState {
  if (isInComa(state, nowMs)) return state;
  const now = computeNeeds(state, nowMs, modifiers, phase);
  const values: NeedValues = { water: now.water, nutrients: now.nutrients, mood: clamp(now.mood - amount) };
  return { ...state, values, updatedAtMs: nowMs };
}

/** Holt Budi aus dem Koma: alle Balken auf COMA_REVIVE_NEED_LEVEL, Stress weg. Kosten regelt P05. */
export function reviveNeeds(nowMs: number): NeedsState {
  const level = clamp(COMA_REVIVE_NEED_LEVEL);
  return { ...createNeeds(nowMs), values: { water: level, nutrients: level, mood: level } };
}

/**
 * Zustand für Budis Gesicht und Animation. Reihenfolge der Priorität:
 * Koma, krank (ein Balken kritisch), gestresst (Überwässerung, falscher Dünger, schlechte Laune),
 * durstig, hungrig, ok. Im Trocknen und danach gibt es keine Bedürfnisse mehr.
 */
export function deriveCondition(needs: NeedsSnapshot, phase: PhaseId): Condition {
  if (phase === 'drying' || phase === 'done') return 'ok';
  if (needs.hoursSinceCare >= COMA_AFTER_REAL_HOURS) return 'coma';
  if (NEED_IDS.some((id) => needs[id] <= NEED_THRESHOLDS.critical)) return 'sick';
  if (needs.overwatered || needs.wrongFertilizer || needs.mood <= NEED_THRESHOLDS.low) return 'stressed';
  if (needs.water <= NEED_THRESHOLDS.low) return 'thirsty';
  if (needs.nutrients <= NEED_THRESHOLDS.low) return 'hungry';
  return 'ok';
}

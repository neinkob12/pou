// PotPou Gesundheit: Schädlinge, Schimmel, Koma, Qualitätsmalus.
// Reine Logik ohne React. Zufall kommt über einen injizierbaren RNG, damit alles testbar ist.
// Wie die Zeit-Engine zählt nichts per Timer: Gewürfelt wird je abgeschlossenem Fenster echter
// Zeit seit `lastCheckAtMs`. Ob man stündlich oder nach Tagen nachrechnet, ergibt dasselbe.

import {
  COMA_AFTER_REAL_HOURS,
  COMA_REVIVE_COINS,
  DEBUG_SPEED_MULTIPLIER,
  DRYING_HUMIDITY_PERCENT,
  DRYING_HUMIDITY_WITH_DEHUMIDIFIER_PERCENT,
  HEALTH_CHECK_INTERVAL_REAL_HOURS,
  MOLD_CHANCE_PER_PERCENT_OVER,
  MOLD_HUMIDITY_THRESHOLD,
  PEST_BASE_CHANCE_PER_CHECK,
  PEST_KINDS,
  PEST_MAX_ON_BUDI,
  PEST_NEGLECT_MULTIPLIER,
  PEST_PROTECTION_REAL_HOURS,
  QUALITY_PENALTY_STARS,
  type PestKind,
  type PhaseId,
} from './config';
import { getPlantStatus, type PlantRecord } from './timeEngine';

const MS_PER_HOUR = 60 * 60 * 1000;
export const HEALTH_CHECK_INTERVAL_MS = HEALTH_CHECK_INTERVAL_REAL_HOURS * MS_PER_HOUR;

/** Zufallszahl in [0, 1). */
export type Rng = () => number;

/** Seedbarer RNG (mulberry32). Gleicher Seed, gleiche Folge. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Pest {
  id: string;
  kind: PestKind;
  spawnedAtMs: number;
}

export interface HealthState {
  pests: Pest[];
  /** Zeitpunkt, ab dem Schimmel da ist. null = kein Schimmel. */
  moldSinceMs: number | null;
  /** Bis hierhin entstehen keine neuen Schädlinge. Setzt P12 über grantPestProtection. */
  pestProtectionUntilMs: number;
  /** Ende des letzten ausgewürfelten Fensters. null = noch nie geprüft. */
  lastCheckAtMs: number | null;
  /** Letzte Pflege oder Wiederbelebung. null = seit dem Pflanzen nichts. */
  lastCareAtMs: number | null;
  nextPestNumber: number;
  revives: number;
}

export function createHealthState(): HealthState {
  return {
    pests: [],
    moldSinceMs: null,
    pestProtectionUntilMs: 0,
    lastCheckAtMs: null,
    lastCareAtMs: null,
    nextPestNumber: 1,
    revives: 0,
  };
}

const PEST_PHASES: readonly PhaseId[] = ['germination', 'seedling', 'vegetative', 'flowering', 'ready'];

/** Phasen, in denen Budi Pflege braucht (und ins Koma fallen kann). */
export function isGrowingPhase(phase: PhaseId): boolean {
  return PEST_PHASES.includes(phase);
}

/** Vernachlässigung 0 bis 1 aus den Balken (0 = alles voll, 1 = alles leer). */
export function neglectFromNeeds(needs: { water: number; nutrients: number; mood: number }): number {
  const avg = (needs.water + needs.nutrients + needs.mood) / 3;
  return clamp01(1 - avg / 100);
}

/** Chance auf einen neuen Schädling in einem Fenster. */
export function pestChancePerCheck(neglect: number, chanceMultiplier = 1): number {
  return clamp01(PEST_BASE_CHANCE_PER_CHECK * (1 + PEST_NEGLECT_MULTIPLIER * clamp01(neglect)) * chanceMultiplier);
}

export function dryingHumidity(hasDehumidifier: boolean): number {
  return hasDehumidifier ? DRYING_HUMIDITY_WITH_DEHUMIDIFIER_PERCENT : DRYING_HUMIDITY_PERCENT;
}

/** Chance auf Schimmel in einem Fenster beim Trocknen. 0 unter der Feuchte-Schwelle. */
export function moldChancePerCheck(humidityPercent: number): number {
  return clamp01((humidityPercent - MOLD_HUMIDITY_THRESHOLD) * MOLD_CHANCE_PER_PERCENT_OVER);
}

export interface HealthCheckOptions {
  /** Vernachlässigung 0 bis 1, fest oder je Fensterzeitpunkt (z. B. aus computeNeeds von P04). */
  neglect: number | ((atMs: number) => number);
  /** Multiplikator auf die Schädlingschance, z. B. Nützlings-Kit aus P15. Standard 1. */
  pestChanceMultiplier?: number;
  hasDehumidifier?: boolean;
  debugMultiplier?: number;
}

/**
 * Würfelt alle abgeschlossenen Fenster seit dem letzten Check aus. Je Fenster genau zwei
 * RNG-Züge (Schädling, Schimmel), damit das Ergebnis nicht davon abhängt, wie oft geprüft wird.
 */
export function runHealthChecks(
  state: HealthState,
  plant: PlantRecord,
  nowMs: number,
  rng: Rng,
  options: HealthCheckOptions,
): HealthState {
  if (state.lastCheckAtMs === null) return { ...state, lastCheckAtMs: Math.max(nowMs, plant.plantedAtMs) };
  const windows = Math.floor((nowMs - state.lastCheckAtMs) / HEALTH_CHECK_INTERVAL_MS);
  if (windows <= 0) return state;

  const debug = options.debugMultiplier ?? DEBUG_SPEED_MULTIPLIER;
  const humidity = dryingHumidity(options.hasDehumidifier ?? false);
  const pests = [...state.pests];
  let { moldSinceMs, nextPestNumber } = state;

  for (let i = 1; i <= windows; i++) {
    const atMs = state.lastCheckAtMs + i * HEALTH_CHECK_INTERVAL_MS;
    const pestRoll = rng();
    const moldRoll = rng();
    const phase = getPlantStatus(plant, atMs, debug).phase;

    const neglect = typeof options.neglect === 'function' ? options.neglect(atMs) : options.neglect;
    const pestChance = pestChancePerCheck(neglect, options.pestChanceMultiplier);
    const pestAllowed = isGrowingPhase(phase) && atMs > state.pestProtectionUntilMs && pests.length < PEST_MAX_ON_BUDI;
    if (pestAllowed && pestRoll < pestChance) {
      // Wiederverwendung des Wurfs für die Art: gleichverteilt innerhalb der Trefferzone.
      const kind = PEST_KINDS[Math.floor((pestRoll / pestChance) * PEST_KINDS.length)] ?? PEST_KINDS[0];
      pests.push({ id: `pest-${nextPestNumber}`, kind, spawnedAtMs: atMs });
      nextPestNumber++;
    }

    if (phase === 'drying' && moldSinceMs === null && moldRoll < moldChancePerCheck(humidity)) {
      moldSinceMs = atMs;
    }
  }

  return {
    ...state,
    pests,
    moldSinceMs,
    nextPestNumber,
    lastCheckAtMs: state.lastCheckAtMs + windows * HEALTH_CHECK_INTERVAL_MS,
  };
}

/** Schädling weggetippt. */
export function removePest(state: HealthState, pestId: string): HealthState {
  if (!state.pests.some((p) => p.id === pestId)) return state;
  return { ...state, pests: state.pests.filter((p) => p.id !== pestId) };
}

/** Gegenmittel angewendet (Kosten: MOLD_TREATMENT_COINS, zahlt der Aufrufer). */
export function treatMold(state: HealthState): HealthState {
  return state.moldSinceMs === null ? state : { ...state, moldSinceMs: null };
}

/** Schutz bis jetzt + Dauer. Ein laufender längerer Schutz wird nie verkürzt. */
export function grantPestProtection(
  state: HealthState,
  nowMs: number,
  durationMs = PEST_PROTECTION_REAL_HOURS * MS_PER_HOUR,
): HealthState {
  return { ...state, pestProtectionUntilMs: Math.max(state.pestProtectionUntilMs, nowMs + durationMs) };
}

export function isPestProtected(state: HealthState, nowMs: number): boolean {
  return nowMs < state.pestProtectionUntilMs;
}

export function noteCare(state: HealthState, atMs: number): HealthState {
  if (state.lastCareAtMs !== null && state.lastCareAtMs >= atMs) return state;
  return { ...state, lastCareAtMs: atMs };
}

/** Ab wann Budi ins Koma fällt: COMA_AFTER_REAL_HOURS nach der letzten Pflege (oder dem Pflanzen). */
export function comaStartsAtMs(state: HealthState, plant: PlantRecord): number {
  const baseline = Math.max(state.lastCareAtMs ?? plant.plantedAtMs, plant.plantedAtMs);
  return baseline + COMA_AFTER_REAL_HOURS * MS_PER_HOUR;
}

/** Koma nur, solange die Pflanze wächst. Beim Trocknen braucht Budi keine Pflege. */
export function isInComa(
  state: HealthState,
  plant: PlantRecord,
  nowMs: number,
  debugMultiplier = DEBUG_SPEED_MULTIPLIER,
): boolean {
  if (nowMs < comaStartsAtMs(state, plant)) return false;
  return isGrowingPhase(getPlantStatus(plant, nowMs, debugMultiplier).phase);
}

/** Wiederbelebungskosten in Münzen. Fest, damit niemand frustriert aufhört. */
export function reviveCost(): number {
  return COMA_REVIVE_COINS;
}

/** Holt Budi aus dem Koma. Bezahlt wird außerhalb (Münzen oder später Rewarded Ad, P29). */
export function revive(state: HealthState, nowMs: number): HealthState {
  return { ...state, lastCareAtMs: nowMs, revives: state.revives + 1 };
}

export function activeDiseaseCount(state: HealthState): number {
  return state.pests.length + (state.moldSinceMs === null ? 0 : 1);
}

/** Qualitätsmalus in Sternen (0 = gesund). P06 zieht ihn vor dem Runden ab. */
export function qualityPenaltyStars(state: HealthState): number {
  const raw =
    state.pests.length * QUALITY_PENALTY_STARS.perPest +
    (state.moldSinceMs === null ? 0 : QUALITY_PENALTY_STARS.mold);
  return Math.min(QUALITY_PENALTY_STARS.max, raw);
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

// Krankheiten im Raum ohne React, damit testbar: regelmäßiger Gesundheits-Check, Wiederbeleben,
// Schimmel behandeln, Sitzplätze der Schädlinge auf Budi.
// Die Spielregeln selbst stehen in src/game/health.ts (P05) und src/game/needs.ts (P04).

import type { HealthCheckOptions, HealthState, Pest } from '../../../game/health';
import { neglectFromNeeds } from '../../../game/health';
import { computeNeeds, NO_MODIFIERS, type NeedsState } from '../../../game/needs';
import type { UpgradeEffects } from '../../../game/shop';
import { getPlantStatus, type PlantRecord } from '../../../game/timeEngine';
import type { GameState } from '../../../store/slices';
import { selectDebugMultiplier } from '../../../store/slices/debug';
import { selectUpgradeEffects } from '../../../store/slices/shop';
import { computeCareView } from '../care/careLogic';

/**
 * Hook-Punkt für P29: Sobald Rewarded Ads da sind, liefert P29 hier `true` (Anzeige geladen,
 * Einwilligung da). Bis dahin bleibt der Werbe-Knopf im Koma deaktiviert.
 */
export function isRewardedReviveReady(): boolean {
  return false;
}

/**
 * Optionen für runHealthChecks: Vernachlässigung je Fenster aus den Balken (P04),
 * Nützlings-Kit und Entfeuchter aus den Shop-Upgrades (P15).
 */
export function healthCheckOptions(
  plant: PlantRecord,
  needs: NeedsState,
  debugMultiplier: number,
  upgrades?: UpgradeEffects,
): HealthCheckOptions {
  return {
    neglect: (atMs) => {
      const { phase } = getPlantStatus(plant, atMs, debugMultiplier);
      return neglectFromNeeds(computeNeeds(needs, atMs, upgrades?.needModifiers ?? NO_MODIFIERS, phase));
    },
    pestChanceMultiplier: upgrades?.pestChanceMultiplier,
    hasDehumidifier: upgrades?.hasDehumidifier,
    debugMultiplier,
  };
}

/**
 * Gesundheit neu zurücksetzen? Der letzte Check liegt nie vor dem Pflanzen derselben Pflanze.
 * Liegt er davor, wurde ein neuer Samen gepflanzt, ohne resetHealth aufzurufen.
 */
export function needsHealthReset(health: HealthState, plant: PlantRecord): boolean {
  return health.lastCheckAtMs !== null && health.lastCheckAtMs < plant.plantedAtMs;
}

/** Gesundheit bis jetzt nachrechnen. Ohne Pflanze passiert nichts. */
export function syncHealth(state: GameState, nowMs: number): void {
  const { plant } = state;
  if (!plant) return;
  if (needsHealthReset(state.health, plant)) {
    state.resetHealth(Math.max(nowMs, plant.plantedAtMs));
    return;
  }
  state.checkHealth(
    plant,
    nowMs,
    healthCheckOptions(plant, state.needs, selectDebugMultiplier(state), selectUpgradeEffects(state)),
  );
}

/** Liegt Budi gerade im Koma? Gleiche Wahrheit wie der Raum (deriveCondition über computeCareView). */
export function isInComa(state: GameState, nowMs: number): boolean {
  const modifiers = selectUpgradeEffects(state).needModifiers;
  return computeCareView(state.plant, state.needs, nowMs, selectDebugMultiplier(state), modifiers).condition === 'coma';
}

/**
 * Wiederbeleben gegen Münzen: erst bezahlen (P05), dann die Balken auffüllen (P04).
 * Nur im Koma, damit ein schneller Doppel-Tap nicht zweimal bezahlt (P31).
 */
export function reviveWithCoins(state: GameState, nowMs: number): boolean {
  if (!isInComa(state, nowMs)) return false;
  if (!state.reviveBudi(nowMs, state.spendCoins)) return false;
  state.reviveFromComa(nowMs);
  return true;
}

/** Wiederbeleben nach einer Rewarded Ad (P29): ohne Münzen, sonst wie reviveWithCoins. */
export function reviveAfterRewardedAd(state: GameState, nowMs: number): void {
  state.reviveBudi(nowMs, () => true);
  state.reviveFromComa(nowMs);
}

/** Schimmel gegen Münzen behandeln (MOLD_TREATMENT_COINS). */
export function cureMoldWithCoins(state: GameState): boolean {
  return state.cureMold(state.spendCoins);
}

/**
 * Sitzplätze auf Budi als Anteil der Leinwand (0 bis 1, links oben = 0/0). Darstellungsregel,
 * kein Balancing: verteilt über Blätter und Topfrand, genug Plätze für PEST_MAX_ON_BUDI.
 */
export const PEST_SPOTS: readonly { x: number; y: number }[] = [
  { x: 0.32, y: 0.38 },
  { x: 0.66, y: 0.3 },
  { x: 0.5, y: 0.5 },
  { x: 0.26, y: 0.62 },
  { x: 0.72, y: 0.58 },
  { x: 0.42, y: 0.22 },
];

/**
 * Fester Platz je Schädling (aus der laufenden Nummer), damit er beim Neuzeichnen nicht springt.
 * Ist der Wunschplatz schon besetzt, nimmt er den nächsten freien.
 */
export function pestSpots(pests: readonly Pest[]): { pest: Pest; x: number; y: number }[] {
  const taken = new Set<number>();
  return pests.map((pest) => {
    const number = Number(pest.id.replace(/\D/g, '')) || 0;
    let index = number % PEST_SPOTS.length;
    for (let tries = 0; taken.has(index) && tries < PEST_SPOTS.length; tries++) {
      index = (index + 1) % PEST_SPOTS.length;
    }
    taken.add(index);
    const spot = PEST_SPOTS[index] ?? PEST_SPOTS[0];
    return { pest, x: spot.x, y: spot.y };
  });
}

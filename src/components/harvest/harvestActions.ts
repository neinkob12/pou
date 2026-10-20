// Ernte-Aktionen über mehrere Slices hinweg (P24). Ohne React, damit die Tests den ganzen
// Ablauf vom Schnitt bis zur Gutschrift durchspielen können. Die Komponenten rufen nur diese Funktionen.

import { TRICHOME_LUPE } from '../../game/config';
import { gameEvents } from '../../game/events';
import { neglectFromNeeds, qualityPenaltyStars } from '../../game/health';
import { computeNeeds, NO_MODIFIERS } from '../../game/needs';
import { newlyUnlocked } from '../../game/progression';
import { getPlantStatus, harvest } from '../../game/timeEngine';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';
import { toProgressStats } from '../../store/slices/progression';
import {
  careScoreFromNeglect,
  computeHarvestResult,
  daysInReady,
  doubleCoinsBonus,
  dryingWindow,
  fallbackSession,
  trichomeScore,
  type HarvestResult,
  type HarvestSession,
} from './harvestFlow';

/** Pflege und Laune zu `nowMs`, für Ertrag und Fallback. */
function careAndMood(nowMs: number, phase: Parameters<typeof computeNeeds>[3]) {
  const needs = computeNeeds(useGameStore.getState().needs, nowMs, NO_MODIFIERS, phase);
  return { careScore: careScoreFromNeglect(neglectFromNeeds(needs)), moodScore: needs.mood };
}

/**
 * Schere: schneidet Budi ab und startet das Trocknen.
 * @param lupeScore Ergebnis der Trichom-Lupe 0 bis 1, null wenn ohne Lupe geschnitten
 * Rückgabe: ob geschnitten wurde (nur in der Phase "ready").
 */
export function cutPlant(lupeScore: number | null, nowMs: number = Date.now()): boolean {
  const state = useGameStore.getState();
  if (!state.plant) return false;
  const multiplier = selectDebugMultiplier(state);
  const status = getPlantStatus(state.plant, nowMs, multiplier);
  if (!status.canHarvest) return false;
  const session: HarvestSession = {
    ...careAndMood(nowMs, status.phase),
    trichomeScore: trichomeScore(lupeScore ?? TRICHOME_LUPE.skippedScore, daysInReady(status)),
    dryingTurns: [],
  };
  state.setPlant(harvest(state.plant, nowMs, multiplier));
  state.startHarvestSession(session);
  return true;
}

/** Einmal wenden im aktuellen Trocknungs-Fenster. Rückgabe: ob gewendet wurde. */
export function turnDryingNow(nowMs: number = Date.now()): boolean {
  const state = useGameStore.getState();
  if (!state.plant || !state.harvestSession) return false;
  const status = getPlantStatus(state.plant, nowMs, selectDebugMultiplier(state));
  if (status.phase !== 'drying') return false;
  const window = dryingWindow(status.phaseProgress);
  if (state.harvestSession.dryingTurns.includes(window)) return false;
  state.turnDrying(window);
  return true;
}

/**
 * Einsammeln nach dem Trocknen: Münzen gutschreiben, Ernte zählen, `harvested` melden,
 * Topf leeren. Rückgabe: das Ergebnis für den Abschluss, null wenn noch nicht fertig.
 */
export function collectHarvest(nowMs: number = Date.now()): HarvestResult | null {
  const state = useGameStore.getState();
  if (!state.plant) return null;
  const status = getPlantStatus(state.plant, nowMs, selectDebugMultiplier(state));
  if (status.phase !== 'done') return null;
  let session = state.harvestSession;
  if (!session) {
    const { careScore, moodScore } = careAndMood(nowMs, status.phase);
    session = fallbackSession(careScore, moodScore);
  }
  const base = computeHarvestResult(state.plant, session, qualityPenaltyStars(state.health));
  const before = toProgressStats(state);
  state.addCoins(base.coins);
  state.recordHarvest();
  // Level und Samen-Fragmente zählt der Progression-Slice selbst beim Ereignis (P16).
  gameEvents.emit('harvested', { strainId: base.strainId, yieldUnits: base.yieldUnits, stars: base.stars, atMs: nowMs });
  const after = toProgressStats(useGameStore.getState());
  const result: HarvestResult = { ...base, newStrains: newlyUnlocked(before, after), coinsDoubled: false };
  state.finishHarvest(result);
  state.setPlant(null);
  return result;
}

/** Hook-Punkt für P29: nach der Werbung die Ernte-Münzen verdoppeln, einmal je Ernte. */
export function claimDoubleCoins(): boolean {
  const state = useGameStore.getState();
  const result = state.harvestResult;
  if (!result || result.coinsDoubled) return false;
  state.addCoins(doubleCoinsBonus(result.coins));
  state.markCoinsDoubled();
  return true;
}

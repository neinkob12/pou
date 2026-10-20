// PotPou Ernte-Logik: Ertrag, Qualitätssterne, Belohnungen vom Kräutermarkt.
// Ernte-Wert = Ertrag × Qualität (docs/KONZEPT.md, "Progression nach der Ernte").
// Reines TypeScript, alle Zahlen aus config.ts.

import {
  BASE_PHASES,
  BASE_YIELD_UNITS,
  COINS_PER_YIELD_UNIT,
  MIN_YIELD_UNITS,
  MOOD_BONUS_THRESHOLD,
  MOOD_YIELD_BONUS,
  QUALITY_STARS,
  SEED_FRAGMENTS_BY_STARS,
  STAR_COIN_MULTIPLIER,
  Strain,
  YIELD_BONUS_PER_EXTRA_VEG_DAY,
  YIELD_CARE_MIN_FACTOR,
} from './config';
import { PlantRecord, vegetativeDaysUsed } from './timeEngine';

export type QualityStars = 1 | 2 | 3 | 4 | 5;

export interface HarvestRewards {
  coins: number;
  seedFragments: number;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Ertragsfaktor aus der Wachstumsdauer: Bonus je Tag über dem Minimum, gedeckelt beim Maximum. */
export function growthFactor(vegDays: number | null): number {
  const extra = clamp(
    (vegDays ?? BASE_PHASES.vegetativeMinDays) - BASE_PHASES.vegetativeMinDays,
    0,
    BASE_PHASES.vegetativeMaxDays - BASE_PHASES.vegetativeMinDays,
  );
  return 1 + extra * YIELD_BONUS_PER_EXTRA_VEG_DAY;
}

/** Ertragsfaktor aus der Pflegequalität (0 bis 1). */
export function careFactor(careScore: number): number {
  return YIELD_CARE_MIN_FACTOR + (1 - YIELD_CARE_MIN_FACTOR) * clamp(careScore, 0, 1);
}

/** Ertragsfaktor aus der Laune (0 bis 100): kleiner Bonus über der Schwelle. */
export function moodFactor(moodScore: number): number {
  return moodScore > MOOD_BONUS_THRESHOLD ? 1 + MOOD_YIELD_BONUS : 1;
}

/**
 * Ertrag in ganzen Einheiten.
 * @param careScore Pflegequalität 0 bis 1 über den Zyklus
 * @param moodScore Laune 0 bis 100 zum Erntezeitpunkt
 */
export function computeYield(plant: PlantRecord, careScore: number, moodScore: number, strain: Strain): number {
  const raw =
    BASE_YIELD_UNITS *
    growthFactor(vegetativeDaysUsed(plant)) *
    careFactor(careScore) *
    moodFactor(moodScore) *
    strain.yieldMultiplier;
  return Math.max(MIN_YIELD_UNITS, Math.round(raw));
}

/**
 * Qualität 1 bis 5 Sterne.
 * @param diseasePenaltyStars Qualitätsmalus aus der Gesundheits-Logik (P05) in Sternen, 0 = gesund
 * @param dryingScore Trocknung 0 bis 1
 * @param trichomeScore Trichom-Lupe 0 bis 1 (1 = perfekter Erntezeitpunkt)
 */
export function computeQualityStars(
  diseasePenaltyStars: number,
  dryingScore: number,
  trichomeScore: number,
): QualityStars {
  const raw =
    QUALITY_STARS.base +
    clamp(trichomeScore, 0, 1) * QUALITY_STARS.trichomeMax +
    clamp(dryingScore, 0, 1) * QUALITY_STARS.dryingMax -
    Math.max(0, diseasePenaltyStars || 0);
  return clamp(Math.round(raw), QUALITY_STARS.min, QUALITY_STARS.max) as QualityStars;
}

/** Was der Kräutermarkt für die Ernte gibt: Münzen und Samen-Fragmente. */
export function harvestRewards(yieldUnits: number, stars: QualityStars, strain: Strain): HarvestRewards {
  const units = Math.max(0, yieldUnits);
  return {
    coins: Math.round(units * COINS_PER_YIELD_UNIT * strain.valueMultiplier * STAR_COIN_MULTIPLIER[stars]),
    seedFragments: SEED_FRAGMENTS_BY_STARS[stars],
  };
}

// Ernte-Ablauf (P24): Trichom-Lupe, Trocknen-Wenden, Abschluss. Reine Logik ohne React, damit testbar.
// Ertrag, Sterne und Belohnungen rechnet src/game/harvest.ts (P06); hier nur die Eingaben dafür.

import {
  DRYING_TURNS,
  READY_GRACE_DAYS,
  REWARDED_AD,
  STRAINS,
  TRICHOME_LUPE,
  type StrainId,
} from '../../game/config';
import { computeQualityStars, computeYield, harvestRewards, type QualityStars } from '../../game/harvest';
import { createRng } from '../../game/health';
import type { PlantRecord, PlantStatus } from '../../game/timeEngine';

export type TrichomeKind = 'clear' | 'milky' | 'amber';

export interface TrichomeHead {
  id: number;
  kind: TrichomeKind;
  /** Position im Lupen-Kreis, 0 bis 1. */
  x: number;
  y: number;
}

/** Was beim Schnitt festgehalten wird und bis zum Einsammeln gespeichert bleibt. */
export interface HarvestSession {
  /** Trichom-Lupe 0 bis 1, inklusive Abzug für zu spätes Ernten. */
  trichomeScore: number;
  /** Pflegequalität 0 bis 1 beim Schnitt. */
  careScore: number;
  /** Laune 0 bis 100 beim Schnitt. */
  moodScore: number;
  /** Trocknungs-Fenster, in denen schon gewendet wurde. */
  dryingTurns: number[];
}

export interface HarvestResult {
  strainId: StrainId;
  yieldUnits: number;
  stars: QualityStars;
  coins: number;
  seedFragments: number;
  /** Sorten, die diese Ernte freigeschaltet hat. */
  newStrains: StrainId[];
  /** Hook für P29: Münzen per Werbung schon verdoppelt? */
  coinsDoubled: boolean;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** Pflanzentage seit Beginn von "ready". 0 in anderen Phasen. */
export function daysInReady(status: PlantStatus): number {
  return status.phase === 'ready' ? Math.max(0, status.ageDays - status.phaseStartDay) : 0;
}

/** Bernstein-Anteil der Köpfchen nach so vielen Tagen in "ready". */
export function amberShare(readyDays: number): number {
  return Math.min(
    TRICHOME_LUPE.maxAmberShare,
    TRICHOME_LUPE.amberShareStart + Math.max(0, readyDays) * TRICHOME_LUPE.amberSharePerDay,
  );
}

/**
 * Köpfchen für die Lupe. Gleicher Seed, gleiches Bild. Mindestens ein milchiges Köpfchen.
 * Positionen auf einem Raster mit etwas Zufall, damit sich nichts überdeckt.
 */
export function buildTrichomeField(seed: number, readyDays: number): TrichomeHead[] {
  const rng = createRng(seed);
  const total = TRICHOME_LUPE.heads;
  const clear = Math.min(TRICHOME_LUPE.clearHeads, total - 1);
  const amber = Math.min(total - clear - 1, Math.round(total * amberShare(readyDays)));
  const kinds: TrichomeKind[] = [];
  for (let i = 0; i < total; i++) kinds.push(i < clear ? 'clear' : i < clear + amber ? 'amber' : 'milky');
  // Fisher-Yates mit dem seedbaren RNG.
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  return kinds.map((kind, id) => {
    const col = id % cols;
    const row = Math.floor(id / cols);
    return {
      id,
      kind,
      x: (col + 0.25 + rng() * 0.5) / cols,
      y: (row + 0.25 + rng() * 0.5) / rows,
    };
  });
}

/** Ergebnis der Lupe 0 bis 1: Anteil gefundener milchiger Köpfchen minus Abzug je Fehlgriff. */
export function scoreLupe(field: readonly TrichomeHead[], tappedIds: readonly number[]): number {
  const tapped = new Set(tappedIds);
  const milky = field.filter((h) => h.kind === 'milky');
  if (milky.length === 0) return 0;
  const hits = milky.filter((h) => tapped.has(h.id)).length;
  const wrong = field.filter((h) => h.kind !== 'milky' && tapped.has(h.id)).length;
  return clamp01(hits / milky.length - wrong * TRICHOME_LUPE.wrongTapPenalty);
}

/** Lupen-Wert mit Abzug für jeden Pflanzentag in "ready" über READY_GRACE_DAYS. */
export function trichomeScore(lupeScore: number, readyDays: number): number {
  const lateDays = Math.max(0, readyDays - READY_GRACE_DAYS);
  return clamp01(lupeScore) * clamp01(1 - lateDays * TRICHOME_LUPE.latePenaltyPerDay);
}

/** Pflegequalität 0 bis 1 aus der Vernachlässigung (neglectFromNeeds, P05). */
export function careScoreFromNeglect(neglect: number): number {
  return clamp01(1 - neglect);
}

/** Trocknungs-Fenster (0 bis windows − 1) zum Fortschritt 0 bis 1. */
export function dryingWindow(progress: number): number {
  return Math.min(DRYING_TURNS.windows - 1, Math.floor(clamp01(progress) * DRYING_TURNS.windows));
}

/** Darf im aktuellen Fenster noch gewendet werden? */
export function canTurn(session: HarvestSession, progress: number): boolean {
  return !session.dryingTurns.includes(dryingWindow(progress));
}

/** Fügt das Fenster hinzu (einmal je Fenster). Gibt eine neue Session zurück. */
export function addDryingTurn(session: HarvestSession, window: number): HarvestSession {
  if (session.dryingTurns.includes(window)) return session;
  return { ...session, dryingTurns: [...session.dryingTurns, window].sort((a, b) => a - b) };
}

/** Trocknungswert 0 bis 1 aus den gewendeten Fenstern. */
export function dryingScore(turns: readonly number[]): number {
  const counted = new Set(turns.filter((w) => w >= 0 && w < DRYING_TURNS.windows)).size;
  return DRYING_TURNS.baseScore + (1 - DRYING_TURNS.baseScore) * (counted / DRYING_TURNS.windows);
}

/** Session, wenn ohne Lupe geschnitten wurde (Debug-Menü oder alter Spielstand). */
export function fallbackSession(careScore: number, moodScore: number): HarvestSession {
  return { trichomeScore: TRICHOME_LUPE.skippedScore, careScore, moodScore, dryingTurns: [] };
}

/** Ergebnis beim Einsammeln. newStrains und coinsDoubled füllt der Aufrufer. */
export function computeHarvestResult(
  plant: PlantRecord,
  session: HarvestSession,
  diseasePenaltyStars: number,
): Omit<HarvestResult, 'newStrains' | 'coinsDoubled'> {
  const strain = STRAINS[plant.strainId];
  const yieldUnits = computeYield(plant, session.careScore, session.moodScore, strain);
  const stars = computeQualityStars(diseasePenaltyStars, dryingScore(session.dryingTurns), session.trichomeScore);
  const { coins, seedFragments } = harvestRewards(yieldUnits, stars, strain);
  return { strainId: plant.strainId, yieldUnits, stars, coins, seedFragments };
}

/** Zusätzliche Münzen, wenn die Werbung (P29) die Ernte-Münzen verdoppelt. */
export function doubleCoinsBonus(coins: number): number {
  return Math.max(0, coins) * (REWARDED_AD.harvestCoinMultiplier - 1);
}

export type HarvestStep = 'summary' | 'empty' | 'growing' | 'ready' | 'drying' | 'done';

/** Welche Ansicht der Ernte-Screen zeigt. Ein offenes Ergebnis geht vor. */
export function harvestStep(status: PlantStatus | null, hasResult: boolean): HarvestStep {
  if (hasResult) return 'summary';
  if (!status) return 'empty';
  if (status.phase === 'ready' || status.phase === 'drying' || status.phase === 'done') return status.phase;
  return 'growing';
}

// PotPou Progression: Level aus Ernten und Sternen, Sorten-Freischaltung nach STRAINS.unlock.
// Reines TypeScript, alle Zahlen aus config.ts (Abschnitt "Level und Freischaltungen").
// Alle Zähler wachsen nur, deshalb wird "freigeschaltet" immer aus ihnen berechnet und nie
// gespeichert. Gespeichert werden nur Ereignis-Freischaltungen (Kölsche Knospe).

import {
  DEBUG_SPEED_MULTIPLIER,
  LEVEL_XP_THRESHOLDS,
  QUALITY_STARS,
  SEED_FRAGMENTS_BY_STARS,
  STRAINS,
  XP_PER_HARVEST,
  XP_PER_STAR,
  type Strain,
  type StrainId,
} from './config';
import { getPlantStatus, type PlantRecord } from './timeEngine';

export interface ProgressStats {
  xp: number;
  /** Abgeschlossene Ernten über alle Zyklen. */
  harvests: number;
  /** Gesammelte Samen-Fragmente (werden beim Freischalten nicht verbraucht). */
  seedFragments: number;
  /** Sorten, die ein Ereignis freigeschaltet hat. */
  eventUnlocks: readonly StrainId[];
}

export const EMPTY_PROGRESS: ProgressStats = { xp: 0, harvests: 0, seedFragments: 0, eventUnlocks: [] };

/** Sorten in Album-Reihenfolge (wie in config.ts). */
export const STRAIN_ORDER = Object.keys(STRAINS) as StrainId[];

function clampStars(stars: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(Number.isFinite(stars) ? stars : QUALITY_STARS.min);
  return Math.min(QUALITY_STARS.max, Math.max(QUALITY_STARS.min, rounded)) as 1 | 2 | 3 | 4 | 5;
}

/** Erfahrung für eine Ernte mit so vielen Sternen. */
export function xpForHarvest(stars: number): number {
  return XP_PER_HARVEST + clampStars(stars) * XP_PER_STAR;
}

/** Zählt eine Ernte: Erfahrung, Erntezähler und Samen-Fragmente (wie harvestRewards in harvest.ts). */
export function applyHarvest(stats: ProgressStats, stars: number): ProgressStats {
  return {
    ...stats,
    xp: stats.xp + xpForHarvest(stars),
    harvests: stats.harvests + 1,
    seedFragments: stats.seedFragments + SEED_FRAGMENTS_BY_STARS[clampStars(stars)],
  };
}

/** Level 1 bis LEVEL_XP_THRESHOLDS.length. */
export function levelForXp(xp: number): number {
  let level = 1;
  LEVEL_XP_THRESHOLDS.forEach((threshold, i) => {
    if (xp >= threshold) level = i + 1;
  });
  return level;
}

export interface LevelProgress {
  level: number;
  /** Erfahrung seit Beginn des aktuellen Levels. */
  xpIntoLevel: number;
  /** Erfahrung vom aktuellen bis zum nächsten Level. null auf dem höchsten Level. */
  xpForNextLevel: number | null;
  /** 0 bis 1 für den Balken, 1 auf dem höchsten Level. */
  progress: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const start = LEVEL_XP_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_XP_THRESHOLDS[level];
  const xpIntoLevel = Math.max(0, xp - start);
  if (next === undefined) return { level, xpIntoLevel, xpForNextLevel: null, progress: 1 };
  const xpForNextLevel = next - start;
  return { level, xpIntoLevel, xpForNextLevel, progress: xpIntoLevel / xpForNextLevel };
}

export interface UnlockProgress {
  current: number;
  target: number;
}

/** Fortschritt zur Freischaltung, z. B. 2 von 3 Ernten. null bei Start- und Ereignis-Sorten. */
export function unlockProgress(strain: Strain, stats: ProgressStats): UnlockProgress | null {
  const u = strain.unlock;
  switch (u.type) {
    case 'harvests':
      return { current: Math.min(stats.harvests, u.count), target: u.count };
    case 'seedFragments':
      return { current: Math.min(stats.seedFragments, u.count), target: u.count };
    case 'level':
      return { current: Math.min(levelForXp(stats.xp), u.level), target: u.level };
    default:
      return null;
  }
}

export function isStrainUnlocked(strain: Strain, stats: ProgressStats): boolean {
  const u = strain.unlock;
  if (u.type === 'start') return true;
  if (u.type === 'event') return stats.eventUnlocks.includes(strain.id);
  const p = unlockProgress(strain, stats);
  return p !== null && p.current >= p.target;
}

export function unlockedStrainIds(stats: ProgressStats): StrainId[] {
  return STRAIN_ORDER.filter((id) => isStrainUnlocked(STRAINS[id], stats));
}

/** Sorten, die zwischen zwei Ständen neu freigeschaltet wurden (für einen Hinweis nach der Ernte). */
export function newlyUnlocked(before: ProgressStats, after: ProgressStats): StrainId[] {
  const had = new Set(unlockedStrainIds(before));
  return unlockedStrainIds(after).filter((id) => !had.has(id));
}

/** Ereignis schaltet eine Sorte frei. Doppelt freischalten ändert nichts. */
export function unlockByEvent(stats: ProgressStats, strainId: StrainId): ProgressStats {
  if (stats.eventUnlocks.includes(strainId)) return stats;
  return { ...stats, eventUnlocks: [...stats.eventUnlocks, strainId] };
}

/** Ein neuer Samen darf nur in einen leeren Topf oder nach dem Trocknen (sonst geht die Ernte verloren). */
export function canPlantNewSeed(
  plant: PlantRecord | null,
  nowMs: number,
  debugMultiplier: number = DEBUG_SPEED_MULTIPLIER,
): boolean {
  return plant === null || getPlantStatus(plant, nowMs, debugMultiplier).phase === 'done';
}

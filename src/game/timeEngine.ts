// PotPou Zeit-Engine.
// Grundprinzip: Es wird nie ein Timer hochgezählt. Alles wird aus Zeitstempeln berechnet,
// damit die Pflanze korrekt weiterwächst, während die App geschlossen ist.

import {
  BASE_PHASES,
  DEBUG_SPEED_MULTIPLIER,
  MS_PER_REAL_DAY,
  PhaseId,
  STRAINS,
  StrainId,
  TIME_SCALE,
  TURBO_TIME_SCALE,
} from './config';

/** Ab `fromMs` gilt `scale` Pflanzentage pro echtem Tag. Ermöglicht Turbo-Kauf mitten im Zyklus. */
export interface ScaleSegment {
  fromMs: number;
  scale: number;
}

export interface PlantRecord {
  strainId: StrainId;
  plantedAtMs: number;
  /** Aufsteigend sortiert. Das erste Segment beginnt beim Pflanzen. */
  scaleSegments: ScaleSegment[];
  /** Zusätzliche Pflanzentage, z. B. durch Rewarded Ads */
  bonusPlantDays: number;
  /** Pflanzenalter (in Tagen), bei dem auf 12/12 umgeschaltet wurde. null = noch nicht. */
  lightFlipAtPlantDay: number | null;
  /** Pflanzenalter (in Tagen), bei dem geerntet wurde. null = noch nicht. */
  harvestedAtPlantDay: number | null;
}

export interface PlantStatus {
  phase: PhaseId;
  ageDays: number;
  phaseStartDay: number;
  /** Ende der Phase in Pflanzentagen. null, wenn es vom Spieler abhängt. */
  phaseEndDay: number | null;
  /** 0 bis 1 für Fortschrittsbalken. Bei offenem Ende relativ zum maximalen Wachstum. */
  phaseProgress: number;
  /** Geschätzte echte Millisekunden bis Phasenende beim aktuellen Tempo. null bei offenem Ende. */
  realMsUntilPhaseEnd: number | null;
  canFlipLight: boolean;
  canHarvest: boolean;
}

export function createPlant(strainId: StrainId, nowMs: number, turbo: boolean): PlantRecord {
  return {
    strainId,
    plantedAtMs: nowMs,
    scaleSegments: [{ fromMs: nowMs, scale: turbo ? TURBO_TIME_SCALE : TIME_SCALE }],
    bonusPlantDays: 0,
    lightFlipAtPlantDay: null,
    harvestedAtPlantDay: null,
  };
}

/** Aktuelle Geschwindigkeit in Pflanzentagen pro echtem Tag. */
export function currentScale(plant: PlantRecord, nowMs: number): number {
  let scale = plant.scaleSegments[0]?.scale ?? TIME_SCALE;
  for (const seg of plant.scaleSegments) {
    if (seg.fromMs <= nowMs) scale = seg.scale;
  }
  return scale;
}

/** Alter der Pflanze in Pflanzentagen. */
export function plantAgeDays(
  plant: PlantRecord,
  nowMs: number,
  debugMultiplier: number = DEBUG_SPEED_MULTIPLIER,
): number {
  let days = 0;
  const segs = plant.scaleSegments;
  for (let i = 0; i < segs.length; i++) {
    const start = Math.max(segs[i].fromMs, plant.plantedAtMs);
    const nextStart = i + 1 < segs.length ? segs[i + 1].fromMs : Infinity;
    const end = Math.min(nextStart, nowMs);
    if (end > start) {
      days += ((end - start) / MS_PER_REAL_DAY) * segs[i].scale * debugMultiplier;
    }
  }
  return days + plant.bonusPlantDays;
}

interface Boundaries {
  germinationEnd: number;
  seedlingEnd: number;
  vegetativeEnd: number | null;
  vegetativeSoftEnd: number;
  floweringEnd: number | null;
  dryingEnd: number | null;
}

function getBoundaries(plant: PlantRecord): Boundaries {
  const strain = STRAINS[plant.strainId];
  const germinationEnd = BASE_PHASES.germinationDays;
  const seedlingEnd = germinationEnd + BASE_PHASES.seedlingDays;

  const vegetativeEnd = strain.autoflower
    ? seedlingEnd + (strain.autoVegetativeDays ?? BASE_PHASES.vegetativeMinDays)
    : plant.lightFlipAtPlantDay;

  const vegetativeSoftEnd = vegetativeEnd ?? seedlingEnd + BASE_PHASES.vegetativeMaxDays;
  const floweringEnd = vegetativeEnd !== null ? vegetativeEnd + strain.floweringDays : null;
  const dryingEnd =
    plant.harvestedAtPlantDay !== null ? plant.harvestedAtPlantDay + BASE_PHASES.dryingDays : null;

  return { germinationEnd, seedlingEnd, vegetativeEnd, vegetativeSoftEnd, floweringEnd, dryingEnd };
}

function progress(age: number, start: number, end: number): number {
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (age - start) / (end - start)));
}

export function getPlantStatus(
  plant: PlantRecord,
  nowMs: number,
  debugMultiplier: number = DEBUG_SPEED_MULTIPLIER,
): PlantStatus {
  const age = plantAgeDays(plant, nowMs, debugMultiplier);
  const b = getBoundaries(plant);
  const speed = currentScale(plant, nowMs) * debugMultiplier;
  const strain = STRAINS[plant.strainId];

  const msUntil = (endDay: number | null): number | null =>
    endDay === null ? null : Math.max(0, ((endDay - age) / speed) * MS_PER_REAL_DAY);

  const make = (phase: PhaseId, start: number, end: number | null, softEnd?: number): PlantStatus => ({
    phase,
    ageDays: age,
    phaseStartDay: start,
    phaseEndDay: end,
    phaseProgress: progress(age, start, end ?? softEnd ?? start),
    realMsUntilPhaseEnd: msUntil(end),
    canFlipLight:
      phase === 'vegetative' &&
      !strain.autoflower &&
      plant.lightFlipAtPlantDay === null &&
      age >= b.seedlingEnd + BASE_PHASES.vegetativeMinDays,
    canHarvest: phase === 'ready',
  });

  if (plant.harvestedAtPlantDay !== null && b.dryingEnd !== null) {
    return age < b.dryingEnd
      ? make('drying', plant.harvestedAtPlantDay, b.dryingEnd)
      : make('done', b.dryingEnd, null, b.dryingEnd);
  }
  if (age < b.germinationEnd) return make('germination', 0, b.germinationEnd);
  if (age < b.seedlingEnd) return make('seedling', b.germinationEnd, b.seedlingEnd);
  if (b.vegetativeEnd === null || age < b.vegetativeEnd) {
    return make('vegetative', b.seedlingEnd, b.vegetativeEnd, b.vegetativeSoftEnd);
  }
  if (b.floweringEnd !== null && age < b.floweringEnd) {
    return make('flowering', b.vegetativeEnd, b.floweringEnd);
  }
  const readyStart = b.floweringEnd ?? age;
  return make('ready', readyStart, null, readyStart);
}

// ---------------------------------------------------------------------------
// Aktionen. Alle geben einen NEUEN Record zurück (keine Mutation).
// ---------------------------------------------------------------------------

export function flipLight(plant: PlantRecord, nowMs: number, debugMultiplier = DEBUG_SPEED_MULTIPLIER): PlantRecord {
  const status = getPlantStatus(plant, nowMs, debugMultiplier);
  if (!status.canFlipLight) return plant;
  return { ...plant, lightFlipAtPlantDay: status.ageDays };
}

export function harvest(plant: PlantRecord, nowMs: number, debugMultiplier = DEBUG_SPEED_MULTIPLIER): PlantRecord {
  const status = getPlantStatus(plant, nowMs, debugMultiplier);
  if (!status.canHarvest) return plant;
  return { ...plant, harvestedAtPlantDay: status.ageDays };
}

/** Turbo-Kauf: ab jetzt doppelte Geschwindigkeit. Bereits vergangene Zeit bleibt unverändert. */
export function applyTurbo(plant: PlantRecord, nowMs: number): PlantRecord {
  if (currentScale(plant, nowMs) === TURBO_TIME_SCALE) return plant;
  return {
    ...plant,
    scaleSegments: [...plant.scaleSegments, { fromMs: segmentStartMs(plant, nowMs), scale: TURBO_TIME_SCALE }],
  };
}

/**
 * Beginn eines neuen Tempo-Segments. Steht die Geräteuhr hinter dem letzten Segment (zurückgestellt),
 * beginnt das neue Segment am letzten, damit die Liste sortiert bleibt und keine Zeit doppelt zählt.
 */
export function segmentStartMs(plant: PlantRecord, nowMs: number): number {
  const last = plant.scaleSegments[plant.scaleSegments.length - 1];
  return last ? Math.max(nowMs, last.fromMs) : nowMs;
}

/** Rewarded Ad: spult die Pflanze vor. */
export function addBonusDays(plant: PlantRecord, days: number): PlantRecord {
  return { ...plant, bonusPlantDays: plant.bonusPlantDays + days };
}

/** Wie viele Pflanzentage lang gewachsen wurde (für den Ertrag). */
export function vegetativeDaysUsed(plant: PlantRecord): number | null {
  const b = getBoundaries(plant);
  return b.vegetativeEnd === null ? null : b.vegetativeEnd - b.seedlingEnd;
}

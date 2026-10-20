// Reine Lichtlogik für Lampe, Raum und Schalter (ohne React, damit testbar).
// Tag und Nacht folgen dem Pflanzenalter aus getPlantStatus, nicht der Uhr des Spielers:
// ein Pflanzentag hat 24 Pflanzenstunden, davon 18 oder 12 mit Licht.

import { BASE_PHASES, LIGHT_HOURS_ON, LIGHT_ON_AT_HOUR, STRAINS, type StrainId } from '../../../game/config';
import type { PlantStatus } from '../../../game/timeEngine';

export type LightSchedule = '18/6' | '12/12' | 'off';

export interface LightState {
  schedule: LightSchedule;
  /** Lampe gerade an. */
  isDay: boolean;
  /** Dunkelphase der Blüte: Licht an wäre Stress für Budi. */
  protectedDark: boolean;
}

/** Was ein Tippen auf die Lampe auslöst. */
export type LampTap = 'confirmFlip' | 'disturb' | 'none';

const HOURS_PER_DAY = 24;

export function isAutoflower(strainId: StrainId): boolean {
  return STRAINS[strainId].autoflower;
}

/** Lichtplan je Phase: Wachstum 18/6, Blüte 12/12 (Autoflower bleibt bei 18/6), Trocknen ohne Licht. */
export function lightSchedule(status: PlantStatus, autoflower: boolean): LightSchedule {
  switch (status.phase) {
    case 'drying':
    case 'done':
      return 'off';
    case 'flowering':
    case 'ready':
      return autoflower ? '18/6' : '12/12';
    default:
      return '18/6';
  }
}

export function hoursOn(schedule: LightSchedule): number {
  if (schedule === 'off') return 0;
  return schedule === '12/12' ? LIGHT_HOURS_ON.flowering : LIGHT_HOURS_ON.vegetative;
}

/** Stunde im aktuellen Pflanzentag, 0 bis unter 24. */
export function plantHourOfDay(ageDays: number): number {
  const fraction = ageDays - Math.floor(ageDays);
  return fraction * HOURS_PER_DAY;
}

/** Ist das Licht zu dieser Pflanzenstunde an? Licht beginnt um LIGHT_ON_AT_HOUR. */
export function isLightOnAt(schedule: LightSchedule, hourOfDay: number): boolean {
  const sinceOn = (((hourOfDay - LIGHT_ON_AT_HOUR) % HOURS_PER_DAY) + HOURS_PER_DAY) % HOURS_PER_DAY;
  return sinceOn < hoursOn(schedule);
}

export function getLightState(status: PlantStatus, autoflower: boolean): LightState {
  const schedule = lightSchedule(status, autoflower);
  const isDay = isLightOnAt(schedule, plantHourOfDay(status.ageDays));
  const bloomDark = schedule === '12/12' && !isDay;
  return { schedule, isDay, protectedDark: bloomDark };
}

/** Lampe antippen: in der Dunkelphase der Blüte stört es Budi, sonst öffnet es den Schalter, wenn er erlaubt ist. */
export function lampTapOutcome(status: PlantStatus, light: LightState): LampTap {
  if (light.protectedDark) return 'disturb';
  if (status.canFlipLight) return 'confirmFlip';
  return 'none';
}

/** Pflanzentag, ab dem auf 12/12 umgeschaltet werden darf (gleiche Regel wie canFlipLight). */
export const FLIP_ALLOWED_FROM_DAY =
  BASE_PHASES.germinationDays + BASE_PHASES.seedlingDays + BASE_PHASES.vegetativeMinDays;

/** Soll der Schalter überhaupt erscheinen? Nur bei Photoperioden-Sorten im Wachstum. */
export function showLightSwitch(status: PlantStatus, autoflower: boolean): boolean {
  return !autoflower && status.phase === 'vegetative';
}

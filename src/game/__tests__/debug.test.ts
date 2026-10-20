import { BASE_PHASES, MS_PER_REAL_DAY, STRAINS, TIME_SCALE, TURBO_TIME_SCALE } from '../config';
import {
  DEBUG_OPTIONS,
  effectiveDebugMultiplier,
  formatClock,
  setAllNeeds,
  retimeForMultiplier,
  setTurboScale,
  skipPlantDays,
} from '../debug';
import { computeNeeds, createNeeds } from '../needs';
import { createPlant, currentScale, flipLight, getPlantStatus, harvest, plantAgeDays } from '../timeEngine';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const MINUTE = 60 * 1000;
const realDays = (d: number) => T0 + d * MS_PER_REAL_DAY;

describe('debug', () => {
  it('gibt im Release-Build immer 1 zurück', () => {
    expect(effectiveDebugMultiplier(1000, false)).toBe(1);
    expect(effectiveDebugMultiplier(1000, true)).toBe(1000);
    expect(effectiveDebugMultiplier(0, true)).toBe(1);
    expect(effectiveDebugMultiplier(Number.NaN, true)).toBe(1);
  });

  it('hält das Alter beim Wechsel des Zeitraffers stabil', () => {
    const p = createPlant('gustav', T0, false);
    const now = realDays(0.5);
    const before = plantAgeDays(p, now, 1);
    const fast = retimeForMultiplier(p, now, 1, 1000);
    expect(plantAgeDays(fast, now, 1000)).toBeCloseTo(before);
    const back = retimeForMultiplier(fast, now, 1000, 1);
    expect(plantAgeDays(back, now, 1)).toBeCloseTo(before);
  });

  it('läuft mit Zeitraffer 1000 schneller weiter', () => {
    const p = retimeForMultiplier(createPlant('gustav', T0, false), T0, 1, 1000);
    const age = plantAgeDays(p, T0 + MINUTE, 1000);
    expect(age).toBeCloseTo((MINUTE / MS_PER_REAL_DAY) * TIME_SCALE * 1000);
  });

  it('spult Pflanzentage vor und ignoriert negative Werte', () => {
    const p = createPlant('gustav', T0, false);
    expect(plantAgeDays(skipPlantDays(p, 7), T0, 1)).toBeCloseTo(7);
    expect(skipPlantDays(p, -3)).toBe(p);
  });

  it('schaltet Turbo an und wieder aus', () => {
    const p = createPlant('gustav', T0, false);
    const on = setTurboScale(p, realDays(1), true);
    expect(currentScale(on, realDays(1))).toBe(TURBO_TIME_SCALE);
    expect(setTurboScale(on, realDays(1), true)).toBe(on);
    const off = setTurboScale(on, realDays(2), false);
    expect(currentScale(off, realDays(2))).toBe(TIME_SCALE);
    expect(plantAgeDays(off, realDays(2), 1)).toBeCloseTo(TIME_SCALE + TURBO_TIME_SCALE);
  });

  it('schafft mit Zeitraffer 1000 einen kompletten Zyklus in unter 20 Minuten', () => {
    const m = Math.max(...DEBUG_OPTIONS.multipliers);
    const strain = STRAINS.gustav;
    let p = retimeForMultiplier(createPlant('gustav', T0, false), T0, 1, m);
    const minuteFor = (day: number) =>
      T0 + Math.ceil((day / (TIME_SCALE * m)) * (MS_PER_REAL_DAY / MINUTE)) * MINUTE;

    const flipDay = BASE_PHASES.germinationDays + BASE_PHASES.seedlingDays + BASE_PHASES.vegetativeMinDays;
    p = flipLight(p, minuteFor(flipDay), m);
    expect(p.lightFlipAtPlantDay).not.toBeNull();

    const readyAt = minuteFor((p.lightFlipAtPlantDay ?? 0) + strain.floweringDays);
    p = harvest(p, readyAt, m);
    expect(p.harvestedAtPlantDay).not.toBeNull();

    const doneAt = minuteFor((p.harvestedAtPlantDay ?? 0) + BASE_PHASES.dryingDays);
    expect(getPlantStatus(p, doneAt, m).phase).toBe('done');
    expect(doneAt - T0).toBeLessThan(20 * MINUTE);
  });

  it('formatiert Restzeiten als h:mm:ss', () => {
    expect(formatClock(0)).toBe('0:00:00');
    expect(formatClock(-5)).toBe('0:00:00');
    expect(formatClock((3600 + 65) * 1000)).toBe('1:01:05');
  });

  it('setzt alle Balken auf einen Wert', () => {
    const state = setAllNeeds(createNeeds(T0), 10, realDays(1));
    const now = computeNeeds(state, realDays(1), {}, 'vegetative');
    expect([now.water, now.nutrients, now.mood]).toEqual([10, 10, 10]);
    expect(state.lastCareAtMs).toBe(T0);
  });
});

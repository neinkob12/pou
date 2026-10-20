import { BASE_PHASES, LIGHT_HOURS_ON, LIGHT_ON_AT_HOUR, MS_PER_REAL_DAY, TIME_SCALE } from '../../../../game/config';
import { createPlant, flipLight, getPlantStatus, harvest, type PlantStatus } from '../../../../game/timeEngine';
import {
  FLIP_ALLOWED_FROM_DAY,
  getLightState,
  hoursOn,
  isAutoflower,
  isLightOnAt,
  lampTapOutcome,
  lightSchedule,
  plantHourOfDay,
  showLightSwitch,
} from '../lightCycle';

const T0 = 1_700_000_000_000;
/** Echte ms für eine Anzahl Pflanzentage beim Standardtempo. */
const msForDays = (days: number) => (days / TIME_SCALE) * MS_PER_REAL_DAY;

function statusAt(phase: PlantStatus['phase'], ageDays: number, canFlipLight = false): PlantStatus {
  return {
    phase,
    ageDays,
    phaseStartDay: 0,
    phaseEndDay: null,
    phaseProgress: 0,
    realMsUntilPhaseEnd: null,
    canFlipLight,
    canHarvest: false,
  };
}

describe('lightSchedule', () => {
  it('18/6 bis zur Blüte, 12/12 in der Blüte, aus beim Trocknen', () => {
    expect(lightSchedule(statusAt('germination', 1), false)).toBe('18/6');
    expect(lightSchedule(statusAt('seedling', 10), false)).toBe('18/6');
    expect(lightSchedule(statusAt('vegetative', 30), false)).toBe('18/6');
    expect(lightSchedule(statusAt('flowering', 60), false)).toBe('12/12');
    expect(lightSchedule(statusAt('ready', 120), false)).toBe('12/12');
    expect(lightSchedule(statusAt('drying', 125), false)).toBe('off');
    expect(lightSchedule(statusAt('done', 140), false)).toBe('off');
  });

  it('Autoflower bleibt in der Blüte bei 18/6', () => {
    expect(lightSchedule(statusAt('flowering', 60), true)).toBe('18/6');
  });

  it('Lichtstunden aus config', () => {
    expect(hoursOn('18/6')).toBe(LIGHT_HOURS_ON.vegetative);
    expect(hoursOn('12/12')).toBe(LIGHT_HOURS_ON.flowering);
    expect(hoursOn('off')).toBe(0);
  });
});

describe('Tag und Nacht', () => {
  it('Stunde im Pflanzentag', () => {
    expect(plantHourOfDay(3)).toBe(0);
    expect(plantHourOfDay(3.5)).toBe(12);
    expect(plantHourOfDay(10.25)).toBeCloseTo(6);
  });

  it('18/6: Licht ab LIGHT_ON_AT_HOUR für 18 Stunden', () => {
    expect(isLightOnAt('18/6', LIGHT_ON_AT_HOUR)).toBe(true);
    expect(isLightOnAt('18/6', LIGHT_ON_AT_HOUR + 17.9)).toBe(true);
    expect(isLightOnAt('18/6', (LIGHT_ON_AT_HOUR + 18) % 24)).toBe(false);
    expect(isLightOnAt('18/6', (LIGHT_ON_AT_HOUR + 23) % 24)).toBe(false);
  });

  it('12/12: genau die Hälfte des Tages dunkel', () => {
    let dark = 0;
    for (let h = 0; h < 24; h++) if (!isLightOnAt('12/12', h)) dark++;
    expect(dark).toBe(12);
  });

  it('aus: nie Licht', () => {
    for (let h = 0; h < 24; h++) expect(isLightOnAt('off', h)).toBe(false);
  });
});

describe('Lampe antippen', () => {
  const nightHour = (LIGHT_ON_AT_HOUR + 18) / 24; // Bruchteil des Pflanzentags nach dem Licht-aus

  it('nachts in der Blüte (12/12) ist es eine Störung', () => {
    const status = statusAt('flowering', 60 + nightHour);
    const light = getLightState(status, false);
    expect(light.isDay).toBe(false);
    expect(light.protectedDark).toBe(true);
    expect(lampTapOutcome(status, light)).toBe('disturb');
  });

  it('tagsüber in der Blüte passiert nichts', () => {
    const status = statusAt('flowering', 60 + LIGHT_ON_AT_HOUR / 24 + 0.01);
    const light = getLightState(status, false);
    expect(light.isDay).toBe(true);
    expect(lampTapOutcome(status, light)).toBe('none');
  });

  it('nachts im Wachstum ist es keine Störung', () => {
    const status = statusAt('vegetative', 30 + 2 / 24);
    const light = getLightState(status, false);
    expect(light.isDay).toBe(false);
    expect(light.protectedDark).toBe(false);
    expect(lampTapOutcome(status, light)).toBe('none');
  });

  it('Autoflower stört nachts in der Blüte nicht', () => {
    const status = statusAt('flowering', 60 + 2 / 24);
    expect(getLightState(status, true).protectedDark).toBe(false);
  });

  it('öffnet den Schalter, wenn canFlipLight', () => {
    const status = statusAt('vegetative', 45 + LIGHT_ON_AT_HOUR / 24 + 0.01, true);
    expect(lampTapOutcome(status, getLightState(status, false))).toBe('confirmFlip');
  });
});

describe('Schalter', () => {
  it('nur bei Photoperioden-Sorten im Wachstum', () => {
    expect(showLightSwitch(statusAt('vegetative', 30), false)).toBe(true);
    expect(showLightSwitch(statusAt('vegetative', 30), true)).toBe(false);
    expect(showLightSwitch(statusAt('flowering', 60), false)).toBe(false);
  });

  it('Freigabetag passt zu canFlipLight der timeEngine', () => {
    expect(FLIP_ALLOWED_FROM_DAY).toBe(
      BASE_PHASES.germinationDays + BASE_PHASES.seedlingDays + BASE_PHASES.vegetativeMinDays,
    );
    const plant = createPlant('gustav', T0, false);
    expect(getPlantStatus(plant, T0 + msForDays(FLIP_ALLOWED_FROM_DAY - 0.1)).canFlipLight).toBe(false);
    expect(getPlantStatus(plant, T0 + msForDays(FLIP_ALLOWED_FROM_DAY + 0.1)).canFlipLight).toBe(true);
  });

  it('Auto-Anton ist Autoflower, Gurken-Gustav nicht', () => {
    expect(isAutoflower('anton')).toBe(true);
    expect(isAutoflower('gustav')).toBe(false);
  });
});

describe('ganzer Zyklus im Zeitraffer', () => {
  const MULT = 1000;
  const realMs = (days: number) => msForDays(days) / MULT;

  it('Photoperiode: alle Phasen mit Lichtwechsel', () => {
    let plant = createPlant('gustav', T0, false);
    const seen: string[] = [];
    const schedules = new Set<string>();
    for (let day = 0; day <= 200; day += 0.5) {
      const now = T0 + realMs(day);
      let status = getPlantStatus(plant, now, MULT);
      if (status.canFlipLight) {
        plant = flipLight(plant, now, MULT);
        status = getPlantStatus(plant, now, MULT);
      }
      if (status.canHarvest) {
        plant = harvest(plant, now, MULT);
        status = getPlantStatus(plant, now, MULT);
      }
      schedules.add(lightSchedule(status, false));
      if (seen[seen.length - 1] !== status.phase) seen.push(status.phase);
    }
    expect(seen).toEqual(['germination', 'seedling', 'vegetative', 'flowering', 'drying', 'done']);
    expect([...schedules].sort()).toEqual(['12/12', '18/6', 'off']);
  });

  it('Autoflower: kein Schalter, blüht trotzdem', () => {
    const plant = createPlant('anton', T0, false);
    const phases = new Set<string>();
    for (let day = 0; day <= 120; day += 0.5) {
      const status = getPlantStatus(plant, T0 + realMs(day), MULT);
      expect(status.canFlipLight).toBe(false);
      expect(showLightSwitch(status, true)).toBe(false);
      phases.add(status.phase);
    }
    expect(phases.has('flowering')).toBe(true);
    expect(phases.has('ready')).toBe(true);
  });
});

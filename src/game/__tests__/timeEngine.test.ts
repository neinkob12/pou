import { MS_PER_REAL_DAY, TIME_SCALE } from '../config';
import {
  addBonusDays,
  applyTurbo,
  createPlant,
  flipLight,
  getPlantStatus,
  harvest,
  plantAgeDays,
  vegetativeDaysUsed,
} from '../timeEngine';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const realDays = (d: number) => T0 + d * MS_PER_REAL_DAY;
const DEBUG = 1;

describe('timeEngine', () => {
  it('rechnet 1 echten Tag in TIME_SCALE Pflanzentage um', () => {
    const p = createPlant('gustav', T0, false);
    expect(plantAgeDays(p, realDays(1), DEBUG)).toBeCloseTo(TIME_SCALE);
  });

  it('startet in der Keimung und wird nach 0,7 echten Tagen zum Sämling', () => {
    const p = createPlant('gustav', T0, false);
    expect(getPlantStatus(p, realDays(0.5), DEBUG).phase).toBe('germination');
    expect(getPlantStatus(p, realDays(0.8), DEBUG).phase).toBe('seedling');
  });

  it('bleibt im Wachstum, bis das Licht umgeschaltet wird', () => {
    const p = createPlant('gustav', T0, false);
    const s = getPlantStatus(p, realDays(20), DEBUG);
    expect(s.phase).toBe('vegetative');
    expect(s.phaseEndDay).toBeNull();
    expect(s.canFlipLight).toBe(true);
  });

  it('erlaubt den Lichtwechsel erst nach dem Mindestwachstum', () => {
    const p = createPlant('gustav', T0, false);
    // 7 + 14 + 21 = 42 Pflanzentage = 4,2 echte Tage
    expect(getPlantStatus(p, realDays(3), DEBUG).canFlipLight).toBe(false);
    expect(getPlantStatus(p, realDays(4.3), DEBUG).canFlipLight).toBe(true);
  });

  it('durchläuft Blüte, Ernte und Trocknen', () => {
    let p = createPlant('gustav', T0, false);
    p = flipLight(p, realDays(4.3), DEBUG); // Alter 43
    expect(getPlantStatus(p, realDays(5), DEBUG).phase).toBe('flowering');
    // Blüte 56 Tage: Ende bei 99 Pflanzentagen = 9,9 echte Tage
    expect(getPlantStatus(p, realDays(10), DEBUG).phase).toBe('ready');
    p = harvest(p, realDays(10), DEBUG);
    expect(getPlantStatus(p, realDays(10.5), DEBUG).phase).toBe('drying');
    expect(getPlantStatus(p, realDays(11), DEBUG).phase).toBe('done');
    expect(vegetativeDaysUsed(p)).toBeCloseTo(22);
  });

  it('ignoriert Ernte vor der Reife', () => {
    const p = createPlant('gustav', T0, false);
    expect(harvest(p, realDays(1), DEBUG)).toBe(p);
  });

  it('Autoflower blüht ohne Lichtwechsel', () => {
    const p = createPlant('anton', T0, false);
    // 7 + 14 + 14 = 35 Pflanzentage
    expect(getPlantStatus(p, realDays(3.6), DEBUG).phase).toBe('flowering');
    expect(getPlantStatus(p, realDays(3.6), DEBUG).canFlipLight).toBe(false);
  });

  it('Turbo verdoppelt das Tempo nur ab dem Kaufzeitpunkt', () => {
    let p = createPlant('gustav', T0, false);
    p = applyTurbo(p, realDays(1)); // 10 Pflanzentage bis hier
    expect(plantAgeDays(p, realDays(2), DEBUG)).toBeCloseTo(30);
  });

  it('Turbo von Anfang an halbiert die Dauer bis zum Sämling', () => {
    const p = createPlant('gustav', T0, true);
    expect(getPlantStatus(p, realDays(0.4), DEBUG).phase).toBe('seedling');
  });

  it('Bonus-Tage aus Werbung spulen vor', () => {
    const p = addBonusDays(createPlant('gustav', T0, false), 3);
    expect(plantAgeDays(p, T0, DEBUG)).toBeCloseTo(3);
  });

  it('läuft korrekt weiter, auch wenn die App tagelang zu war', () => {
    const p = createPlant('gustav', T0, false);
    expect(getPlantStatus(p, realDays(30), DEBUG).ageDays).toBeCloseTo(300);
  });
});

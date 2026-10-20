import { DRYING_TURNS, READY_GRACE_DAYS, REWARDED_AD, STRAINS, TRICHOME_LUPE } from '../../../game/config';
import { computeQualityStars, computeYield, harvestRewards } from '../../../game/harvest';
import { createPlant, getPlantStatus, type PlantRecord } from '../../../game/timeEngine';
import {
  addDryingTurn,
  amberShare,
  buildTrichomeField,
  canTurn,
  careScoreFromNeglect,
  computeHarvestResult,
  daysInReady,
  doubleCoinsBonus,
  dryingScore,
  dryingWindow,
  fallbackSession,
  harvestStep,
  scoreLupe,
  trichomeScore,
  type HarvestSession,
} from '../harvestFlow';

const T0 = Date.UTC(2026, 0, 1);
const session: HarvestSession = { trichomeScore: 1, careScore: 1, moodScore: 100, dryingTurns: [] };

function flippedPlant(): PlantRecord {
  return { ...createPlant('gustav', T0, false), lightFlipAtPlantDay: 42 };
}

describe('Trichom-Lupe', () => {
  it('gleicher Seed, gleiches Feld; Anzahl aus der Config', () => {
    const a = buildTrichomeField(7, 0);
    expect(a).toEqual(buildTrichomeField(7, 0));
    expect(a).toHaveLength(TRICHOME_LUPE.heads);
    expect(a.filter((h) => h.kind === 'clear')).toHaveLength(TRICHOME_LUPE.clearHeads);
  });

  it('Positionen liegen im Kreis-Rahmen 0 bis 1', () => {
    for (const h of buildTrichomeField(3, 2)) {
      expect(h.x).toBeGreaterThan(0);
      expect(h.x).toBeLessThan(1);
      expect(h.y).toBeGreaterThan(0);
      expect(h.y).toBeLessThan(1);
    }
  });

  it('je länger in "ready", desto mehr Bernstein, gedeckelt; immer mindestens ein milchiges', () => {
    const amber = (days: number) => buildTrichomeField(1, days).filter((h) => h.kind === 'amber').length;
    expect(amber(10)).toBeGreaterThan(amber(0));
    expect(amberShare(1000)).toBe(TRICHOME_LUPE.maxAmberShare);
    expect(buildTrichomeField(1, 1000).some((h) => h.kind === 'milky')).toBe(true);
  });

  it('alle milchigen gefunden, keine Fehlgriffe: 1', () => {
    const field = buildTrichomeField(5, 0);
    const milky = field.filter((h) => h.kind === 'milky').map((h) => h.id);
    expect(scoreLupe(field, milky)).toBe(1);
  });

  it('Fehlgriffe ziehen ab, nie unter 0', () => {
    const field = buildTrichomeField(5, 0);
    const milky = field.filter((h) => h.kind === 'milky').map((h) => h.id);
    const wrong = field.find((h) => h.kind !== 'milky')!.id;
    expect(scoreLupe(field, [...milky, wrong])).toBeCloseTo(1 - TRICHOME_LUPE.wrongTapPenalty);
    expect(scoreLupe(field, field.filter((h) => h.kind !== 'milky').map((h) => h.id))).toBe(0);
    expect(scoreLupe(field, [])).toBe(0);
  });

  it('zu spät geerntet: Abzug je Tag über READY_GRACE_DAYS', () => {
    expect(trichomeScore(1, READY_GRACE_DAYS)).toBe(1);
    expect(trichomeScore(1, READY_GRACE_DAYS + 2)).toBeCloseTo(1 - 2 * TRICHOME_LUPE.latePenaltyPerDay);
    expect(trichomeScore(1, READY_GRACE_DAYS + 1000)).toBe(0);
  });

  it('daysInReady zählt nur in "ready"', () => {
    const plant = flippedPlant();
    const readyDay = 42 + STRAINS.gustav.floweringDays;
    const at = (day: number) => T0 + (day / 10) * 24 * 3600 * 1000;
    expect(daysInReady(getPlantStatus(plant, at(readyDay + 3), 1))).toBeCloseTo(3);
    expect(daysInReady(getPlantStatus(plant, at(10), 1))).toBe(0);
  });
});

describe('Trocknen', () => {
  it('Fenster aus dem Fortschritt', () => {
    expect(dryingWindow(0)).toBe(0);
    expect(dryingWindow(0.99)).toBe(DRYING_TURNS.windows - 1);
    expect(dryingWindow(1)).toBe(DRYING_TURNS.windows - 1);
  });

  it('einmal wenden je Fenster', () => {
    const turned = addDryingTurn(session, 0);
    expect(turned.dryingTurns).toEqual([0]);
    expect(addDryingTurn(turned, 0)).toBe(turned);
    expect(canTurn(turned, 0)).toBe(false);
    expect(canTurn(turned, 0.9)).toBe(true);
  });

  it('Trocknungswert: Basis ohne Wenden, 1 bei allen Fenstern', () => {
    expect(dryingScore([])).toBe(DRYING_TURNS.baseScore);
    const all = Array.from({ length: DRYING_TURNS.windows }, (_, i) => i);
    expect(dryingScore(all)).toBe(1);
    expect(dryingScore([0, 0, 99])).toBeCloseTo(DRYING_TURNS.baseScore + (1 - DRYING_TURNS.baseScore) / DRYING_TURNS.windows);
  });
});

describe('Abschluss', () => {
  it('rechnet mit der Ernte-Logik aus P06', () => {
    const plant = flippedPlant();
    const s = { ...session, dryingTurns: [0, 1, 2], careScore: 0.8, moodScore: 70 };
    const r = computeHarvestResult(plant, s, 0.5);
    const yieldUnits = computeYield(plant, 0.8, 70, STRAINS.gustav);
    const stars = computeQualityStars(0.5, 1, 1);
    expect(r).toEqual({ strainId: 'gustav', yieldUnits, stars, ...harvestRewards(yieldUnits, stars, STRAINS.gustav) });
  });

  it('Krankheitsmalus senkt die Sterne', () => {
    const plant = flippedPlant();
    expect(computeHarvestResult(plant, session, 3).stars).toBeLessThan(computeHarvestResult(plant, session, 0).stars);
  });

  it('Fallback ohne Lupe nutzt skippedScore', () => {
    expect(fallbackSession(0.5, 60)).toEqual({
      trichomeScore: TRICHOME_LUPE.skippedScore,
      careScore: 0.5,
      moodScore: 60,
      dryingTurns: [],
    });
  });

  it('Pflege aus Vernachlässigung, Münz-Verdopplung aus REWARDED_AD', () => {
    expect(careScoreFromNeglect(0.25)).toBe(0.75);
    expect(careScoreFromNeglect(2)).toBe(0);
    expect(doubleCoinsBonus(40)).toBe(40 * (REWARDED_AD.harvestCoinMultiplier - 1));
    expect(doubleCoinsBonus(-5)).toBe(0);
  });
});

describe('harvestStep', () => {
  it('Ergebnis zuerst, dann Phase', () => {
    const plant = flippedPlant();
    const at = (day: number) => T0 + (day / 10) * 24 * 3600 * 1000;
    expect(harvestStep(null, true)).toBe('summary');
    expect(harvestStep(null, false)).toBe('empty');
    expect(harvestStep(getPlantStatus(plant, at(10), 1), false)).toBe('growing');
    expect(harvestStep(getPlantStatus(plant, at(42 + STRAINS.gustav.floweringDays + 1), 1), false)).toBe('ready');
    expect(harvestStep(getPlantStatus(plant, at(10), 1), true)).toBe('summary');
  });
});

import { COMA_AFTER_REAL_HOURS, COMA_REVIVE_COINS, MOLD_TREATMENT_COINS, PEST_MAX_ON_BUDI } from '../../../../game/config';
import type { Pest } from '../../../../game/health';
import { computeNeeds, deriveCondition, NO_MODIFIERS } from '../../../../game/needs';
import { createPlant, getPlantStatus } from '../../../../game/timeEngine';
import { useGameStore } from '../../../../store/gameStore';
import {
  cureMoldWithCoins,
  healthCheckOptions,
  isRewardedReviveReady,
  needsHealthReset,
  pestSpots,
  reviveAfterRewardedAd,
  reviveWithCoins,
  syncHealth,
} from '../healthLogic';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const HOUR = 60 * 60 * 1000;
const initial = useGameStore.getState();
const plant = createPlant('gustav', T0, false);

function startPlant(seed = 7) {
  useGameStore.setState({ ...initial, plant }, true);
  const s = useGameStore.getState();
  s.resetNeeds(T0);
  s.resetHealth(T0, seed);
}

function conditionAt(nowMs: number) {
  const s = useGameStore.getState();
  const { phase } = getPlantStatus(plant, nowMs, 1);
  return deriveCondition(computeNeeds(s.needs, nowMs, NO_MODIFIERS, phase), phase);
}

const pest = (n: number): Pest => ({ id: `pest-${n}`, kind: 'spiderMite', spawnedAtMs: T0 });

describe('Gesundheit im Raum', () => {
  beforeEach(() => startPlant());

  it('Vernachlässigung kommt aus den Balken und steigt ohne Pflege', () => {
    const { neglect } = healthCheckOptions(plant, useGameStore.getState().needs, 1);
    if (typeof neglect !== 'function') throw new Error('neglect sollte eine Funktion sein');
    expect(neglect(T0 + 30 * HOUR)).toBeGreaterThan(neglect(T0 + HOUR));
  });

  it('syncHealth würfelt nach Abwesenheit Schädlinge, ohne Pflanze nichts', () => {
    syncHealth(useGameStore.getState(), T0 + 72 * HOUR);
    expect(useGameStore.getState().health.pests.length).toBeGreaterThan(0);
    expect(useGameStore.getState().health.pests.length).toBeLessThanOrEqual(PEST_MAX_ON_BUDI);

    useGameStore.setState({ plant: null });
    const before = useGameStore.getState().health;
    syncHealth(useGameStore.getState(), T0 + 200 * HOUR);
    expect(useGameStore.getState().health).toBe(before);
  });

  it('setzt die Gesundheit bei einer neuen Pflanze ohne resetHealth zurück', () => {
    syncHealth(useGameStore.getState(), T0 + 72 * HOUR);
    const later = T0 + 100 * HOUR;
    const next = createPlant('gustav', later, false);
    useGameStore.setState({ plant: next });
    expect(needsHealthReset(useGameStore.getState().health, next)).toBe(true);
    syncHealth(useGameStore.getState(), later + 1000);
    const { health } = useGameStore.getState();
    expect(health.pests).toEqual([]);
    expect(needsHealthReset(health, next)).toBe(false);
  });

  it('Wiederbeleben kostet Münzen und holt Budi aus dem Koma', () => {
    const now = T0 + (COMA_AFTER_REAL_HOURS + 1) * HOUR;
    expect(conditionAt(now)).toBe('coma');

    expect(reviveWithCoins(useGameStore.getState(), now)).toBe(false);
    expect(conditionAt(now)).toBe('coma');

    useGameStore.getState().addCoins(COMA_REVIVE_COINS + 5);
    expect(reviveWithCoins(useGameStore.getState(), now)).toBe(true);
    expect(useGameStore.getState().coins).toBe(5);
    expect(conditionAt(now)).not.toBe('coma');
    expect(useGameStore.getState().health.revives).toBe(1);
  });

  it('Werbe-Wiederbelebung ist noch aus, der Hook-Punkt belebt ohne Münzen', () => {
    expect(isRewardedReviveReady()).toBe(false);
    const now = T0 + (COMA_AFTER_REAL_HOURS + 1) * HOUR;
    reviveAfterRewardedAd(useGameStore.getState(), now);
    expect(useGameStore.getState().coins).toBe(0);
    expect(conditionAt(now)).not.toBe('coma');
  });

  it('Schimmel behandeln kostet Münzen', () => {
    useGameStore.setState((s) => ({ health: { ...s.health, moldSinceMs: T0 } }));
    expect(cureMoldWithCoins(useGameStore.getState())).toBe(false);
    useGameStore.getState().addCoins(MOLD_TREATMENT_COINS);
    expect(cureMoldWithCoins(useGameStore.getState())).toBe(true);
    expect(useGameStore.getState().health.moldSinceMs).toBeNull();
    expect(useGameStore.getState().coins).toBe(0);
  });

  it('Schädlinge sitzen auf festen, verschiedenen Plätzen innerhalb der Leinwand', () => {
    const pests = [pest(1), pest(7), pest(2), pest(13), pest(4)];
    const spots = pestSpots(pests);
    const keys = spots.map(({ x, y }) => `${x}/${y}`);
    expect(new Set(keys).size).toBe(pests.length);
    spots.forEach(({ x, y }) => {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(1);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(1);
    });
    // Wegtippen eines anderen Schädlings verschiebt die übrigen nicht.
    const three = pestSpots([pest(1), pest(2), pest(4)]);
    expect(pestSpots([pest(2), pest(4)])).toEqual(three.slice(1));
  });
});

import { coinsForScore } from '../../components/minigames/framework/session';
import { BASE_PHASES, MINIGAME_REWARDS, STRAINS, TIME_SCALE, UPGRADES } from '../config';

// Balancing P23: 3 Runden am Tag sollen ungefähr ein Shop-Upgrade pro Zyklus ergeben.
// Rechnung und Annahmen: docs/progress/p23.md.

/** Kürzester Zyklus ohne Autoflower in echten Tagen (Wachstum auf dem Minimum). */
function cycleRealDays(floweringDays: number): number {
  const { germinationDays, seedlingDays, vegetativeMinDays, dryingDays } = BASE_PHASES;
  return (germinationDays + seedlingDays + vegetativeMinDays + floweringDays + dryingDays) / TIME_SCALE;
}

function averageUpgradePrice(): number {
  const prices = Object.values(UPGRADES).flatMap((levels) => levels.map((l) => l.price));
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}

describe('Minigame-Belohnungen (P23)', () => {
  const { typicalScores, plannedRoundsPerDay } = MINIGAME_REWARDS;
  const perRound =
    (coinsForScore(typicalScores.smash) + coinsForScore(typicalScores.drops) + coinsForScore(typicalScores.jump)) / 3;

  it('ergibt bei 3 Runden am Tag rund ein Upgrade pro Zyklus (Startsorte)', () => {
    const coinsPerCycle = perRound * plannedRoundsPerDay * cycleRealDays(STRAINS.gustav.floweringDays);
    const upgrades = coinsPerCycle / averageUpgradePrice();
    expect(upgrades).toBeGreaterThanOrEqual(0.8);
    expect(upgrades).toBeLessThanOrEqual(1.5);
  });

  it('bleibt auch mit der langsamsten Sorte unter zwei Upgrades pro Zyklus', () => {
    const slowest = Math.max(...Object.values(STRAINS).map((s) => s.floweringDays));
    const coinsPerCycle = perRound * plannedRoundsPerDay * cycleRealDays(slowest);
    expect(coinsPerCycle / averageUpgradePrice()).toBeLessThan(2);
  });

  it('gibt jedem der drei Spiele bei typischer Leistung Münzen', () => {
    for (const score of Object.values(typicalScores)) expect(coinsForScore(score)).toBeGreaterThan(0);
  });
});

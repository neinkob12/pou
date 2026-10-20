import { PEST_PROTECTION_REAL_HOURS, PEST_SMASH } from '../../../../game/config';
import { isPestProtected } from '../../../../game/health';
import { useGameStore } from '../../../../store/gameStore';
import { grantSmashReward } from '../smashReward';

const initial = useGameStore.getState();
const HOUR = 60 * 60 * 1000;

beforeEach(() => {
  useGameStore.setState(initial, true);
});

describe('Schädlings-Smash: Schädlingsschutz', () => {
  it('genug Punkte: Schutz für PEST_PROTECTION_REAL_HOURS im Health-Slice', () => {
    const now = 1_000_000;
    expect(grantSmashReward(PEST_SMASH.protectionMinScore, now)).toBe(true);
    const { health } = useGameStore.getState();
    expect(health.pestProtectionUntilMs).toBe(now + PEST_PROTECTION_REAL_HOURS * HOUR);
    expect(isPestProtected(health, now + PEST_PROTECTION_REAL_HOURS * HOUR - 1)).toBe(true);
    expect(isPestProtected(health, now + PEST_PROTECTION_REAL_HOURS * HOUR)).toBe(false);
  });

  it('zu wenig Punkte: kein Schutz', () => {
    expect(grantSmashReward(PEST_SMASH.protectionMinScore - 1, 5000)).toBe(false);
    expect(isPestProtected(useGameStore.getState().health, 5000)).toBe(false);
  });

  it('zweite Runde verlängert ab jetzt, verkürzt nie', () => {
    grantSmashReward(50, 0);
    grantSmashReward(50, 2 * HOUR);
    expect(useGameStore.getState().health.pestProtectionUntilMs).toBe(2 * HOUR + PEST_PROTECTION_REAL_HOURS * HOUR);
  });
});

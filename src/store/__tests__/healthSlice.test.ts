import { COMA_REVIVE_COINS, MOLD_TREATMENT_COINS, PEST_PROTECTION_REAL_HOURS } from '../../game/config';
import { gameEvents } from '../../game/events';
import { createPlant } from '../../game/timeEngine';
import { useGameStore } from '../gameStore';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const HOUR = 60 * 60 * 1000;
const initial = useGameStore.getState();
const plant = createPlant('gustav', T0, false);

describe('Health-Slice', () => {
  beforeEach(() => useGameStore.setState(initial, true));

  it('ist registriert und startet gesund', () => {
    const { health } = useGameStore.getState();
    expect(health.pests).toEqual([]);
    expect(health.moldSinceMs).toBeNull();
  });

  it('würfelt reproduzierbar aus dem gespeicherten Seed und dreht ihn weiter', () => {
    const run = () => {
      useGameStore.setState(initial, true);
      const s = useGameStore.getState();
      s.resetHealth(T0, 123);
      s.checkHealth(plant, T0 + 48 * HOUR, { neglect: 1 });
      return useGameStore.getState();
    };
    const a = run();
    const b = run();
    expect(a.health).toEqual(b.health);
    expect(a.health.pests.length).toBeGreaterThan(0);
    expect(a.healthSeed).not.toBe(123);
  });

  it('tippt Schädlinge weg und setzt Schutz', () => {
    const s = useGameStore.getState();
    s.resetHealth(T0, 5);
    s.checkHealth(plant, T0 + 48 * HOUR, { neglect: 1 });
    const pest = useGameStore.getState().health.pests[0];
    s.tapPest(pest.id);
    expect(useGameStore.getState().health.pests.some((p) => p.id === pest.id)).toBe(false);
    s.protectFromPests(T0 + 48 * HOUR);
    expect(useGameStore.getState().health.pestProtectionUntilMs).toBe(T0 + (48 + PEST_PROTECTION_REAL_HOURS) * HOUR);
  });

  it('merkt sich Pflege aus dem careAction-Ereignis', () => {
    useGameStore.getState().resetHealth(T0);
    gameEvents.emit('careAction', { action: 'water', atMs: T0 + 5 * HOUR });
    expect(useGameStore.getState().health.lastCareAtMs).toBe(T0 + 5 * HOUR);
  });

  it('belebt nur gegen Münzen wieder', () => {
    const s = useGameStore.getState();
    expect(s.reviveBudi(T0 + 30 * HOUR, s.spendCoins)).toBe(false);
    s.addCoins(COMA_REVIVE_COINS);
    expect(s.reviveBudi(T0 + 30 * HOUR, s.spendCoins)).toBe(true);
    const { coins, health } = useGameStore.getState();
    expect(coins).toBe(0);
    expect(health.revives).toBe(1);
    expect(health.lastCareAtMs).toBe(T0 + 30 * HOUR);
  });

  it('behandelt Schimmel nur, wenn welcher da ist, und kassiert dann', () => {
    const s = useGameStore.getState();
    s.addCoins(100);
    expect(s.cureMold(s.spendCoins)).toBe(false);
    useGameStore.setState({ health: { ...useGameStore.getState().health, moldSinceMs: T0 } });
    expect(s.cureMold(s.spendCoins)).toBe(true);
    expect(useGameStore.getState().health.moldSinceMs).toBeNull();
    expect(useGameStore.getState().coins).toBe(100 - MOLD_TREATMENT_COINS);
  });
});

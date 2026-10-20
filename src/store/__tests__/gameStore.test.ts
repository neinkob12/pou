import { MS_PER_REAL_DAY, TIME_SCALE, TURBO_TIME_SCALE } from '../../game/config';
import { currentScale } from '../../game/timeEngine';
import { useGameStore } from '../gameStore';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const initial = useGameStore.getState();

describe('gameStore', () => {
  beforeEach(() => useGameStore.setState(initial, true));

  it('enthält den Plant-Slice mit Startwerten', () => {
    const s = useGameStore.getState();
    expect(s.plant).toBeNull();
    expect(s.coins).toBe(0);
    expect(s.turbo).toBe(false);
  });

  it('pflanzt einen Samen im normalen Tempo', () => {
    useGameStore.getState().plantSeed('gustav', T0);
    const plant = useGameStore.getState().plant;
    expect(plant?.strainId).toBe('gustav');
    expect(plant && currentScale(plant, T0)).toBe(TIME_SCALE);
  });

  it('addiert Münzen und gibt nur aus, was da ist', () => {
    const s = useGameStore.getState();
    s.addCoins(10);
    expect(s.spendCoins(15)).toBe(false);
    expect(s.spendCoins(4)).toBe(true);
    expect(useGameStore.getState().coins).toBe(6);
  });

  it('beschleunigt mit Turbo die laufende Pflanze', () => {
    const s = useGameStore.getState();
    s.plantSeed('gustav', T0);
    s.activateTurbo(T0 + MS_PER_REAL_DAY);
    const { plant, turbo } = useGameStore.getState();
    expect(turbo).toBe(true);
    expect(plant && currentScale(plant, T0 + 2 * MS_PER_REAL_DAY)).toBe(TURBO_TIME_SCALE);
  });
});

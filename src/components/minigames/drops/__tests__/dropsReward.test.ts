import { DROPS_GAME, NEED_MAX } from '../../../../game/config';
import { createNeeds } from '../../../../game/needs';
import { useGameStore } from '../../../../store/gameStore';
import { applyDropsReward } from '../dropsReward';

const HOUR = 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 1);
const initial = useGameStore.getState();

function needsAt(water: number, nutrients: number) {
  const n = createNeeds(T0);
  return { ...n, values: { ...n.values, water, nutrients } };
}

beforeEach(() => {
  useGameStore.setState(initial, true);
});

describe('applyDropsReward', () => {
  it('ohne Pflanze füllt sich nichts', () => {
    expect(applyDropsReward(5, 5, T0)).toBeNull();
  });

  it('füllt Wasser und Nährstoffe über applyCare, je höchstens +40', () => {
    useGameStore.getState().plantSeed('gustav', T0 - 3 * 24 * HOUR); // Wachstum, Grenze 100
    useGameStore.setState({ needs: needsAt(20, 30) });
    const reward = applyDropsReward(1000, 1000, T0);
    expect(reward).toEqual({ water: DROPS_GAME.maxBarGainPerRound, nutrients: DROPS_GAME.maxBarGainPerRound });
    const { values, overwateredUntilMs, wrongFertilizerUntilMs } = useGameStore.getState().needs;
    expect(values.water).toBe(60);
    expect(values.nutrients).toBe(70);
    expect(overwateredUntilMs).toBe(needsAt(0, 0).overwateredUntilMs);
    expect(wrongFertilizerUntilMs).toBe(needsAt(0, 0).wrongFertilizerUntilMs);
  });

  it('überwässert nie, auch nicht im empfindlichen Keimling', () => {
    useGameStore.getState().plantSeed('gustav', T0);
    useGameStore.setState({ needs: needsAt(60, NEED_MAX) });
    const reward = applyDropsReward(1000, 1000, T0);
    expect(reward).toEqual({ water: 10, nutrients: 0 });
    const s = useGameStore.getState().needs;
    expect(s.values.water).toBe(70);
    expect(s.overwateredUntilMs).toBe(needsAt(0, 0).overwateredUntilMs);
  });

  it('im Koma füllt sich nichts', () => {
    useGameStore.getState().plantSeed('gustav', T0);
    useGameStore.setState({ needs: createNeeds(T0) });
    expect(applyDropsReward(5, 5, T0 + 25 * HOUR)).toBeNull();
  });
});

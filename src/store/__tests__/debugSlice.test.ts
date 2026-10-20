import { DEBUG_SPEED_MULTIPLIER } from '../../game/config';
import { useGameStore } from '../gameStore';
import { selectDebugMultiplier } from '../slices/debug';

const initial = useGameStore.getState();

describe('debug-Slice', () => {
  beforeEach(() => useGameStore.setState(initial, true));

  it('startet mit dem Produktionswert', () => {
    expect(useGameStore.getState().debugMultiplier).toBe(DEBUG_SPEED_MULTIPLIER);
  });

  it('wirkt im Entwicklungs-Build, im Release-Build nicht', () => {
    useGameStore.getState().setDebugMultiplier(1000);
    const s = useGameStore.getState();
    expect(selectDebugMultiplier(s, true)).toBe(1000);
    expect(selectDebugMultiplier(s, false)).toBe(DEBUG_SPEED_MULTIPLIER);
  });
});

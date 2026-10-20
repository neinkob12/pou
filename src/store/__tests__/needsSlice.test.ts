import { COMA_AFTER_REAL_HOURS, COMA_REVIVE_NEED_LEVEL, NEED_START } from '../../game/config';
import { gameEvents } from '../../game/events';
import { useGameStore } from '../gameStore';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const HOUR = 60 * 60 * 1000;
const initial = useGameStore.getState();

describe('needs-Slice', () => {
  beforeEach(() => {
    useGameStore.setState(initial, true);
    useGameStore.getState().resetNeeds(T0);
  });
  afterEach(() => gameEvents.clear());

  it('setzt beim neuen Samen die Startwerte', () => {
    const { needs } = useGameStore.getState();
    expect(needs.values).toEqual(NEED_START);
    expect(needs.updatedAtMs).toBe(T0);
  });

  it('pflegt und löst careAction aus', () => {
    const listener = jest.fn();
    gameEvents.on('careAction', listener);
    const ok = useGameStore.getState().care({ type: 'water', phase: 'vegetative' }, T0 + HOUR);
    expect(ok).toBe(true);
    expect(useGameStore.getState().needs.lastCareAtMs).toBe(T0 + HOUR);
    expect(listener).toHaveBeenCalledWith({ action: 'water', atMs: T0 + HOUR });
  });

  it('im Koma wirkt Pflege nicht und löst kein Ereignis aus', () => {
    const listener = jest.fn();
    gameEvents.on('careAction', listener);
    const at = T0 + COMA_AFTER_REAL_HOURS * HOUR;
    expect(useGameStore.getState().care({ type: 'pet', phase: 'vegetative' }, at)).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });

  it('holt Budi aus dem Koma', () => {
    const at = T0 + 2 * COMA_AFTER_REAL_HOURS * HOUR;
    useGameStore.getState().reviveFromComa(at);
    const { needs } = useGameStore.getState();
    expect(needs.values.water).toBe(COMA_REVIVE_NEED_LEVEL);
    expect(needs.lastCareAtMs).toBe(at);
  });
});

import { MS_PER_REAL_DAY, TIME_SCALE, TURBO_TIME_SCALE } from '../../../game/config';
import { currentScale, getPlantStatus, plantAgeDays } from '../../../game/timeEngine';
import { useGameStore } from '../../../store/gameStore';
import { selectDebugMultiplier } from '../../../store/slices/debug';
import { createDebugActions } from '../debugActions';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const initial = useGameStore.getState();

describe('Debug-Aktionen', () => {
  let now = T0;
  const actions = createDebugActions(useGameStore, () => now);
  const age = () => {
    const s = useGameStore.getState();
    return s.plant ? plantAgeDays(s.plant, now, selectDebugMultiplier(s)) : 0;
  };

  beforeEach(() => {
    now = T0;
    useGameStore.setState(initial, true);
  });

  it('wechselt den Zeitraffer ohne Altersprung und läuft dann schneller', () => {
    actions.plantSeed();
    now = T0 + MS_PER_REAL_DAY / 10;
    const before = age();
    actions.setMultiplier(1000);
    expect(age()).toBeCloseTo(before);
    now += 60 * 1000;
    expect(age() - before).toBeCloseTo((60 * 1000 / MS_PER_REAL_DAY) * TIME_SCALE * 1000);
  });

  it('spult vor, gibt Münzen, schaltet Turbo und setzt alles zurück', () => {
    actions.plantSeed();
    actions.skipDays(30);
    expect(age()).toBeCloseTo(30);
    actions.giveCoins(100);
    actions.setTurbo(true);
    const s = useGameStore.getState();
    expect(s.coins).toBe(100);
    expect(s.turbo).toBe(true);
    expect(s.plant && currentScale(s.plant, now)).toBe(TURBO_TIME_SCALE);

    actions.setMultiplier(100);
    actions.reset();
    const r = useGameStore.getState();
    expect(r.plant).toBeNull();
    expect(r.coins).toBe(0);
    expect(r.turbo).toBe(false);
    expect(r.debugMultiplier).toBe(1);
  });

  it('kommt per Vorspulen, Lichtwechsel und Ernte bis zum Ende', () => {
    actions.plantSeed();
    actions.skipDays(42);
    actions.flipLight();
    actions.skipDays(56);
    actions.harvest();
    actions.skipDays(7);
    const s = useGameStore.getState();
    expect(s.plant && getPlantStatus(s.plant, now, 1).phase).toBe('done');
  });
});

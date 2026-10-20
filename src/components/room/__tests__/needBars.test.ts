import { useGameStore } from '../../../store/gameStore';
import { NEED_BARS, PLACEHOLDER_NEED_VALUES, selectNeedBars } from '../needBars';

describe('selectNeedBars', () => {
  it('liefert bis P10 die Platzhalterwerte für alle vier Balken', () => {
    const values = selectNeedBars(useGameStore.getState());
    expect(values).toBe(PLACEHOLDER_NEED_VALUES);
    for (const bar of NEED_BARS) {
      expect(values[bar.id]).toBeGreaterThanOrEqual(0);
      expect(values[bar.id]).toBeLessThanOrEqual(100);
    }
  });

  it('hat genau die vier Balken aus dem Konzept', () => {
    expect(NEED_BARS.map((b) => b.id)).toEqual(['water', 'nutrients', 'light', 'mood']);
  });
});

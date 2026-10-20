import { NEED_BARS, PLACEHOLDER_NEED_VALUES } from '../needBars';

describe('NEED_BARS', () => {
  it('hat genau die vier Balken aus dem Konzept', () => {
    expect(NEED_BARS.map((b) => b.id)).toEqual(['water', 'nutrients', 'light', 'mood']);
  });

  it('Platzhalterwerte liegen zwischen 0 und 100', () => {
    for (const bar of NEED_BARS) {
      expect(PLACEHOLDER_NEED_VALUES[bar.id]).toBeGreaterThanOrEqual(0);
      expect(PLACEHOLDER_NEED_VALUES[bar.id]).toBeLessThanOrEqual(100);
    }
  });
});

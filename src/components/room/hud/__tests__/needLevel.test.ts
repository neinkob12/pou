import { NEED_THRESHOLDS } from '../../../../game/config';
import { needLevel } from '../needLevel';

describe('needLevel', () => {
  it('ok ab der Unbehagen-Schwelle', () => {
    expect(needLevel(100)).toBe('ok');
    expect(needLevel(NEED_THRESHOLDS.low)).toBe('ok');
  });

  it('low knapp darunter, critical ab der kritischen Schwelle', () => {
    expect(needLevel(NEED_THRESHOLDS.low - 1)).toBe('low');
    expect(needLevel(NEED_THRESHOLDS.critical)).toBe('critical');
    expect(needLevel(0)).toBe('critical');
  });
});

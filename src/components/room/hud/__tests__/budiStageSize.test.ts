import { BUDI_STAGE_MAX, BUDI_STAGE_MIN, budiStageSize } from '../budiStageSize';

describe('budiStageSize', () => {
  it('wächst mit der Bildschirmhöhe', () => {
    expect(budiStageSize(844)).toBeGreaterThan(budiStageSize(700));
    expect(budiStageSize(844)).toBe(304);
  });

  it('bleibt in den Grenzen, auch auf sehr kleinen und sehr großen Bildschirmen', () => {
    expect(budiStageSize(480)).toBe(BUDI_STAGE_MIN);
    expect(budiStageSize(1400)).toBe(BUDI_STAGE_MAX);
  });
});

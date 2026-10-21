import { BRAND_BESIDE_FROM_WIDTH, BRAND_WIDTH, brandBeside, FRAME_WIDTH } from '../frameLayout';

describe('brandBeside', () => {
  it('stellt den Titel am breiten Rechner neben den Rahmen', () => {
    expect(brandBeside(1280)).toBe(true);
  });

  it('legt ihn bei schmalen Fenstern in die Ecke', () => {
    expect(brandBeside(800)).toBe(false);
  });

  it('schaltet genau an der Grenze um', () => {
    expect(brandBeside(BRAND_BESIDE_FROM_WIDTH - 1)).toBe(false);
    expect(brandBeside(BRAND_BESIDE_FROM_WIDTH)).toBe(true);
  });

  it('lässt neben Titel und Rahmen Luft', () => {
    expect(BRAND_WIDTH + FRAME_WIDTH).toBeLessThan(BRAND_BESIDE_FROM_WIDTH);
  });
});

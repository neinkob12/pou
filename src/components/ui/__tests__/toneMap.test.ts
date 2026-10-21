import { clamp01, toneForColor } from '../toneMap';

describe('toneForColor', () => {
  it('bildet Palettenfarben auf Spiel-Farbtöne ab', () => {
    expect(toneForColor('plantLight')).toBe('leaf');
    expect(toneForColor('lavender')).toBe('grape');
    expect(toneForColor('ink')).toBe('stone');
  });
});

describe('clamp01', () => {
  it('begrenzt auf 0 bis 1', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(7)).toBe(1);
    expect(clamp01(Number.NaN)).toBe(0);
  });
});

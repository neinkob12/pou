import { darken, lighten, mix, pathBounds } from '../tint';

describe('mix', () => {
  it('liefert die Endfarben bei 0 und 1', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
  });

  it('mischt in der Mitte und begrenzt t', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
    expect(mix('#000000', '#FFFFFF', 2)).toBe('#FFFFFF');
  });
});

describe('lighten und darken', () => {
  it('hellt auf und dunkelt ab', () => {
    expect(lighten('#FF7A8A', 1)).toBe('#FFFFFF');
    expect(darken('#FF7A8A', 0)).toBe('#FF7A8A');
    expect(parseInt(darken('#FF7A8A', 0.3).slice(1, 3), 16)).toBeLessThan(0xff);
  });
});

describe('pathBounds', () => {
  it('findet das Rechteck eines Pfads', () => {
    expect(pathBounds('M10 20 L60 20 L60 90 Z')).toEqual({ x: 10, y: 20, width: 50, height: 70 });
  });

  it('zählt Kurvenpunkte und negative Zahlen mit', () => {
    expect(pathBounds('M-5 10 C0 0 20 0 30 10 Q40 30 30 40 Z')).toEqual({ x: -5, y: 0, width: 45, height: 40 });
  });

  it('gibt bei leerem Pfad ein leeres Rechteck', () => {
    expect(pathBounds('')).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});

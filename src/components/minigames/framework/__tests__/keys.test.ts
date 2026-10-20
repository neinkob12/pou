import { axisFromKeys, digitIndex, isAxisKey } from '../input/keys';

describe('Tastatur', () => {
  it('Pfeiltasten und A/D geben die Richtung, die letzte gewinnt', () => {
    expect(axisFromKeys([])).toBe(0);
    expect(axisFromKeys(['ArrowLeft'])).toBe(-1);
    expect(axisFromKeys(['d'])).toBe(1);
    expect(axisFromKeys(['ArrowLeft', 'D'])).toBe(1);
    expect(axisFromKeys(['Shift', 'a'])).toBe(-1);
    expect(axisFromKeys(['Shift'])).toBe(0);
  });

  it('erkennt Richtungstasten', () => {
    expect(isAxisKey('ArrowRight')).toBe(true);
    expect(isAxisKey('Enter')).toBe(false);
  });

  it('Ziffern 1 bis 9 werden Index 0 bis 8', () => {
    expect(digitIndex('1')).toBe(0);
    expect(digitIndex('3')).toBe(2);
    expect(digitIndex('0')).toBe(-1);
    expect(digitIndex('a')).toBe(-1);
    expect(digitIndex('10')).toBe(-1);
  });
});

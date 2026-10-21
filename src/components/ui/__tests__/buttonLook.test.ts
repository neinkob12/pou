import { tones } from '../../../lib/theme';
import { buttonTone, needsTextShadow, VARIANT_TONE } from '../buttonLook';

describe('buttonTone', () => {
  it('nimmt den Farbton der Variante', () => {
    expect(buttonTone('primary', false)).toBe(tones.coral);
    expect(buttonTone('danger', false)).toBe(tones.danger);
    expect(VARIANT_TONE.secondary).toBe('cream');
  });

  it('macht gesperrte Knöpfe grau', () => {
    expect(buttonTone('primary', true)).toBe(tones.stone);
  });
});

describe('needsTextShadow', () => {
  it('gibt nur heller Schrift einen Schatten', () => {
    expect(needsTextShadow(tones.coral)).toBe(true);
    expect(needsTextShadow(tones.cream)).toBe(false);
  });
});

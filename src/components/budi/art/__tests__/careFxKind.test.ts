import { fxKindFor } from '../careFxKind';

describe('fxKindFor', () => {
  it('zeigt je Pflege eigene Teilchen', () => {
    expect(fxKindFor({ type: 'pet', feedback: 'success' })).toBe('hearts');
    expect(fxKindFor({ type: 'water', feedback: 'success' })).toBe('drops');
    expect(fxKindFor({ type: 'fertilizeGrow', feedback: 'success' })).toBe('sparkles');
  });

  it('grummelt bei zu viel Pflege', () => {
    expect(fxKindFor({ type: 'water', feedback: 'warning' })).toBe('grumble');
  });

  it('zeigt nichts ohne Pflege oder wenn sie nicht ankam', () => {
    expect(fxKindFor(null)).toBeNull();
    expect(fxKindFor({ type: 'water', feedback: 'error' })).toBeNull();
  });
});

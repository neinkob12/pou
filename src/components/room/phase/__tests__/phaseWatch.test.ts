import { PHASE_ORDER, parseSeenPhase, phaseTransitions } from '../phaseWatch';

const P = 1_700_000_000_000;

describe('phaseTransitions', () => {
  it('ohne gespeicherte Phase: kein Wechsel', () => {
    expect(phaseTransitions(null, P, 'seedling')).toEqual([]);
  });

  it('gleiche Phase: kein Wechsel', () => {
    expect(phaseTransitions({ plantedAtMs: P, phase: 'seedling' }, P, 'seedling')).toEqual([]);
  });

  it('ein Schritt', () => {
    expect(phaseTransitions({ plantedAtMs: P, phase: 'germination' }, P, 'seedling')).toEqual([
      { from: 'germination', to: 'seedling' },
    ]);
  });

  it('nach Tagen im Hintergrund: alle übersprungenen Schritte', () => {
    expect(phaseTransitions({ plantedAtMs: P, phase: 'germination' }, P, 'flowering')).toEqual([
      { from: 'germination', to: 'seedling' },
      { from: 'seedling', to: 'vegetative' },
      { from: 'vegetative', to: 'flowering' },
    ]);
  });

  it('neue Pflanze: kein Wechsel', () => {
    expect(phaseTransitions({ plantedAtMs: P, phase: 'done' }, P + 1, 'germination')).toEqual([]);
  });

  it('Rückschritt (z. B. Debug-Reset): kein Wechsel', () => {
    expect(phaseTransitions({ plantedAtMs: P, phase: 'flowering' }, P, 'vegetative')).toEqual([]);
  });

  it('Reihenfolge deckt alle Phasen ab', () => {
    expect(PHASE_ORDER).toHaveLength(7);
  });
});

describe('parseSeenPhase', () => {
  it('liest gültige Werte', () => {
    expect(parseSeenPhase(JSON.stringify({ plantedAtMs: P, phase: 'ready' }))).toEqual({ plantedAtMs: P, phase: 'ready' });
  });

  it('fehlend oder kaputt: null', () => {
    expect(parseSeenPhase(undefined)).toBeNull();
    expect(parseSeenPhase('{kaputt')).toBeNull();
    expect(parseSeenPhase(JSON.stringify({ plantedAtMs: 'x', phase: 'ready' }))).toBeNull();
    expect(parseSeenPhase(JSON.stringify({ plantedAtMs: P, phase: 'blub' }))).toBeNull();
    expect(parseSeenPhase('null')).toBeNull();
  });
});

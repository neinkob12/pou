import { centerOf, getCoinAnchor, setCoinAnchor } from '../coinTarget';
import { dismissCelebration, enqueueCelebration, type Celebration } from '../celebrationQueue';

describe('enqueueCelebration', () => {
  it('reiht einen Level-Aufstieg hinter die laufende Feier (ART-5)', () => {
    const q = enqueueCelebration([{ kind: 'phase', phase: 'flowering' }], { kind: 'level', level: 3 });
    expect(q).toEqual([
      { kind: 'phase', phase: 'flowering' },
      { kind: 'level', level: 3 },
    ]);
  });

  it('hängt Feiern der Reihe nach an', () => {
    const q = enqueueCelebration(enqueueCelebration([], { kind: 'chest', coins: 60 }), {
      kind: 'phase',
      phase: 'seedling',
    });
    expect(q).toEqual([
      { kind: 'chest', coins: 60 },
      { kind: 'phase', phase: 'seedling' },
    ]);
  });

  it('zeigt bei mehreren Phasenwechseln nur den letzten', () => {
    let q: Celebration[] = [];
    q = enqueueCelebration(q, { kind: 'phase', phase: 'seedling' });
    q = enqueueCelebration(q, { kind: 'phase', phase: 'vegetative' });
    expect(q).toEqual([{ kind: 'phase', phase: 'vegetative' }]);
  });

  it('ersetzt nur eine wartende Phasen-Feier, nicht die sichtbare Kiste', () => {
    let q: Celebration[] = [{ kind: 'chest', coins: 60 }];
    q = enqueueCelebration(q, { kind: 'phase', phase: 'seedling' });
    q = enqueueCelebration(q, { kind: 'phase', phase: 'vegetative' });
    expect(q).toEqual([
      { kind: 'chest', coins: 60 },
      { kind: 'phase', phase: 'vegetative' },
    ]);
  });

  it('schließt die vorderste Feier', () => {
    expect(dismissCelebration([{ kind: 'chest', coins: 1 }])).toEqual([]);
  });
});

describe('coinAnchor', () => {
  it('merkt sich die Mitte des Münzzählers', () => {
    expect(centerOf(10, 20, 100, 40)).toEqual({ x: 60, y: 40 });
    setCoinAnchor({ x: 1, y: 2 });
    expect(getCoinAnchor()).toEqual({ x: 1, y: 2 });
    setCoinAnchor(null);
    expect(getCoinAnchor()).toBeNull();
  });
});

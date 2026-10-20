import { FACT_CARDS } from '../../../content/facts';
import { cardsReachedBy, newlyUnlockedIds } from '../unlock';

describe('Fakten-Freischaltung', () => {
  it('schaltet in der Keimung nur Keimungs-Karten frei', () => {
    const ids = newlyUnlockedIds([], 'germination');
    expect(ids).toEqual(['germination-bbch', 'germination-temperature']);
  });

  it('holt übersprungene Phasen nach', () => {
    const ids = newlyUnlockedIds([], 'flowering');
    const phases = new Set(ids.map((id) => FACT_CARDS.find((c) => c.id === id)?.phase));
    expect(phases).toEqual(new Set(['germination', 'vegetative', 'flowering']));
  });

  it('liefert schon freigeschaltete Karten nicht noch einmal', () => {
    const first = newlyUnlockedIds([], 'vegetative');
    expect(newlyUnlockedIds(first, 'vegetative')).toEqual([]);
    expect(newlyUnlockedIds(first, 'flowering').every((id) => !first.includes(id))).toBe(true);
  });

  it('erreicht in der Phase done alle Karten', () => {
    expect(cardsReachedBy('done')).toHaveLength(FACT_CARDS.length);
  });

  it('Sämling bringt keine neue Karte', () => {
    const afterGermination = newlyUnlockedIds([], 'germination');
    expect(newlyUnlockedIds(afterGermination, 'seedling')).toEqual([]);
  });
});

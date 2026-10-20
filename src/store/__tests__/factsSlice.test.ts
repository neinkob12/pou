import { FACT_CARDS } from '../../content/facts';
import { useGameStore } from '../gameStore';

const initial = useGameStore.getState();

describe('facts-Slice', () => {
  beforeEach(() => useGameStore.setState(initial, true));

  it('startet ohne Karten', () => {
    expect(useGameStore.getState().unlockedFactIds).toEqual([]);
    expect(useGameStore.getState().pendingFactIds).toEqual([]);
  });

  it('schaltet frei und legt die neuen Karten in die Popup-Warteschlange', () => {
    const fresh = useGameStore.getState().unlockFactsForPhase('germination');
    expect(fresh).toHaveLength(2);
    expect(useGameStore.getState().unlockedFactIds).toEqual(fresh);
    expect(useGameStore.getState().pendingFactIds).toEqual(fresh);
  });

  it('ist idempotent', () => {
    useGameStore.getState().unlockFactsForPhase('germination');
    expect(useGameStore.getState().unlockFactsForPhase('germination')).toEqual([]);
    expect(useGameStore.getState().unlockedFactIds).toHaveLength(2);
  });

  it('arbeitet die Warteschlange der Reihe nach ab', () => {
    const [first, second] = useGameStore.getState().unlockFactsForPhase('germination');
    useGameStore.getState().dismissFactPopup();
    expect(useGameStore.getState().pendingFactIds).toEqual([second]);
    expect(useGameStore.getState().unlockedFactIds).toContain(first);
    useGameStore.getState().dismissFactPopup();
    expect(useGameStore.getState().pendingFactIds).toEqual([]);
  });

  it('schaltet bis zur Lagerung alle Karten frei', () => {
    useGameStore.getState().unlockFactsForPhase('done');
    expect(useGameStore.getState().unlockedFactIds).toHaveLength(FACT_CARDS.length);
  });
});

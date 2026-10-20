import { SEED_FRAGMENTS_BY_STARS } from '../../game/config';
import { gameEvents } from '../../game/events';
import { unlockedStrainIds, xpForHarvest } from '../../game/progression';
import { useGameStore } from '../gameStore';
import { toProgressStats } from '../slices/progression';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const initial = useGameStore.getState();

describe('Progression-Slice', () => {
  beforeEach(() => useGameStore.setState(initial, true));

  it('ist registriert und startet bei null', () => {
    const s = useGameStore.getState();
    expect(toProgressStats(s)).toEqual({ xp: 0, harvests: 0, seedFragments: 0, eventUnlocks: [] });
    expect(unlockedStrainIds(toProgressStats(s))).toEqual(['gustav']);
  });

  it('zählt eine Ernte beim Ereignis harvested', () => {
    gameEvents.emit('harvested', { strainId: 'gustav', yieldUnits: 10, stars: 4, atMs: T0 });
    const s = useGameStore.getState();
    expect(s.progressHarvests).toBe(1);
    expect(s.xp).toBe(xpForHarvest(4));
    expect(s.seedFragments).toBe(SEED_FRAGMENTS_BY_STARS[4]);
  });

  it('schaltet Lila Lotte nach drei Ernten frei', () => {
    for (let i = 0; i < 3; i++) useGameStore.getState().addHarvestProgress(3);
    expect(unlockedStrainIds(toProgressStats(useGameStore.getState()))).toContain('lotte');
  });

  it('schaltet Ereignis-Sorten einmalig frei', () => {
    useGameStore.getState().unlockStrainByEvent('koelsch');
    useGameStore.getState().unlockStrainByEvent('koelsch');
    expect(useGameStore.getState().eventUnlocks).toEqual(['koelsch']);
  });
});

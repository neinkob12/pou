import { MS_PER_REAL_DAY, STRAINS, TIME_SCALE } from '../../../game/config';
import { gameEvents } from '../../../game/events';
import { getPlantStatus } from '../../../game/timeEngine';
import { clock } from '../../../lib/clock';
import { useGameStore } from '../../../store/gameStore';
import { claimDoubleCoins, collectHarvest, cutPlant, turnDryingNow } from '../harvestActions';

const T0 = Date.UTC(2026, 0, 1);
const FLIP_DAY = 42;
const READY_DAY = FLIP_DAY + STRAINS.gustav.floweringDays;
const initial = useGameStore.getState();

/** Echte Zeit zum Pflanzentag (Zeitraffer 1). */
const at = (plantDay: number) => T0 + (plantDay / TIME_SCALE) * MS_PER_REAL_DAY;

function plantReadyGustav() {
  const s = useGameStore.getState();
  s.setDebugMultiplier(1);
  s.plantSeed('gustav', T0);
  s.resetNeeds(T0);
  s.resetHealth(T0);
  const plant = useGameStore.getState().plant!;
  s.setPlant({ ...plant, lightFlipAtPlantDay: FLIP_DAY });
}

describe('Ernte-Aktionen', () => {
  beforeEach(() => useGameStore.setState(initial, true));

  it('ohne Zeitangabe gilt die Spieluhr, nicht die Geräteuhr (P31)', () => {
    plantReadyGustav();
    // Geräteuhr zurückgestellt: Date.now() liegt vor der Ernte, die Spieluhr nicht.
    const deviceNow = jest.spyOn(Date, 'now').mockReturnValue(T0);
    const gameNow = jest.spyOn(clock, 'now').mockReturnValue(at(READY_DAY + 1));
    try {
      expect(cutPlant(1)).toBe(true);
      gameNow.mockReturnValue(at(READY_DAY + 9));
      expect(collectHarvest()).not.toBeNull();
    } finally {
      deviceNow.mockRestore();
      gameNow.mockRestore();
    }
  });

  it('ohne Pflanze oder vor "ready": nichts', () => {
    expect(cutPlant(1, T0)).toBe(false);
    plantReadyGustav();
    expect(cutPlant(1, at(10))).toBe(false);
    expect(useGameStore.getState().harvestSession).toBeNull();
  });

  it('ganzer Ablauf: Schnitt, Wenden, Einsammeln, Gutschrift, harvested, leerer Topf', () => {
    plantReadyGustav();
    // Pflege kurz vor dem Schnitt, damit die Balken voll sind.
    useGameStore.getState().resetNeeds(at(READY_DAY + 1));
    expect(cutPlant(1, at(READY_DAY + 1))).toBe(true);
    const cut = useGameStore.getState();
    expect(getPlantStatus(cut.plant!, at(READY_DAY + 1), 1).phase).toBe('drying');
    expect(cut.harvestSession).toMatchObject({ trichomeScore: 1, dryingTurns: [] });

    // Trocknen dauert 7 Pflanzentage; in jedem Drittel einmal wenden.
    expect(turnDryingNow(at(READY_DAY + 1.5))).toBe(true);
    expect(turnDryingNow(at(READY_DAY + 1.6))).toBe(false);
    expect(turnDryingNow(at(READY_DAY + 4))).toBe(true);
    expect(turnDryingNow(at(READY_DAY + 7.5))).toBe(true);
    expect(useGameStore.getState().harvestSession!.dryingTurns).toEqual([0, 1, 2]);

    expect(collectHarvest(at(READY_DAY + 5))).toBeNull();

    const events: number[] = [];
    const off = gameEvents.on('harvested', ({ stars }) => events.push(stars));
    const result = collectHarvest(at(READY_DAY + 9))!;
    off();

    const s = useGameStore.getState();
    expect(result.stars).toBe(5);
    expect(s.coins).toBe(result.coins);
    expect(s.harvestsTotal).toBe(1);
    expect(s.progressHarvests).toBe(1);
    expect(events).toEqual([5]);
    expect(s.plant).toBeNull();
    expect(s.harvestSession).toBeNull();
    expect(s.harvestResult).toEqual(result);
  });

  it('Münzen verdoppeln nur einmal', () => {
    plantReadyGustav();
    cutPlant(1, at(READY_DAY));
    const result = collectHarvest(at(READY_DAY + 8))!;
    expect(claimDoubleCoins()).toBe(true);
    expect(claimDoubleCoins()).toBe(false);
    expect(useGameStore.getState().coins).toBe(result.coins * 2);
    expect(useGameStore.getState().harvestResult!.coinsDoubled).toBe(true);
  });

  it('ohne Lupe geschnitten (Debug-Menü): Einsammeln klappt mit Fallback', () => {
    plantReadyGustav();
    const plant = useGameStore.getState().plant!;
    useGameStore.getState().setPlant({ ...plant, harvestedAtPlantDay: READY_DAY });
    const result = collectHarvest(at(READY_DAY + 8));
    expect(result).not.toBeNull();
    expect(useGameStore.getState().plant).toBeNull();
  });

  it('meldet neu freigeschaltete Sorten', () => {
    useGameStore.setState({ progressHarvests: 2 });
    plantReadyGustav();
    cutPlant(1, at(READY_DAY));
    expect(collectHarvest(at(READY_DAY + 8))!.newStrains).toContain('lotte');
  });
});

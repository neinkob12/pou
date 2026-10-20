import { createMonotonicClock } from '../../game/clock';
import { SAVE_KEY } from '../../store/gameStore';
import { HIGHEST_SEEN_KEY } from '../storage';

describe('geteilte Spieluhr (src/lib/clock)', () => {
  let nowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    jest.resetModules();
    nowSpy = jest.spyOn(Date, 'now');
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  // Frische Uhr je Test; der Speicher muss aus derselben Modul-Registry kommen wie die Uhr.
  function loadClock(): typeof import('../clock') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- frische Instanz je Test
    return require('../clock');
  }
  function loadStorage(): typeof import('../storage') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- dieselbe Registry wie loadClock
    return require('../storage');
  }

  it('liefert nie einen kleineren Wert, auch wenn Date.now zurückspringt', () => {
    const { clock } = loadClock();
    nowSpy.mockReturnValue(1_000_000);
    expect(clock.now()).toBe(1_000_000);
    nowSpy.mockReturnValue(400_000);
    expect(clock.now()).toBe(1_000_000);
    expect(clock.last()?.deviceBehind).toBe(true);
    nowSpy.mockReturnValue(1_500_000);
    expect(clock.now()).toBe(1_500_000);
  });

  it('ist monoton über eine Folge zufälliger Sprünge', () => {
    const { clock } = loadClock();
    const device = [5, 9, 3, 12, 12, 1, 20, 0, 19, 25].map((d) => d * 1000);
    let prev = -1;
    for (const d of device) {
      nowSpy.mockReturnValue(d);
      const t = clock.now();
      expect(t).toBeGreaterThanOrEqual(prev);
      prev = t;
    }
    expect(prev).toBe(25_000);
  });

  it('übersteht einen Neustart: Höchststand landet im Speicher und wird wieder gelesen', () => {
    const { clock, seedFromSavedGame } = loadClock();
    const { storage, highestSeenStore } = loadStorage();
    nowSpy.mockReturnValue(2_000_000);
    clock.now();
    expect(storage.getNumber(HIGHEST_SEEN_KEY)).toBe(2_000_000);
    // Neustart: neue Uhr mit derselben Einrichtung, Gerätezeit weit zurück.
    const restarted = createMonotonicClock(highestSeenStore, () => Date.now(), seedFromSavedGame);
    nowSpy.mockReturnValue(100);
    expect(restarted.now()).toBe(2_000_000);
  });

  it('nimmt ohne gespeicherten Höchststand den höchsten Zeitstempel aus dem Spielstand', () => {
    loadStorage().storage.set(SAVE_KEY, JSON.stringify({ state: { plant: null, needs: { updatedAtMs: 3_000_000, lastCareAtMs: 10 } }, version: 1 }));
    nowSpy.mockReturnValue(50);
    expect(loadClock().clock.now()).toBe(3_000_000);
  });

  it('ignoriert einen kaputten Spielstand', () => {
    loadStorage().storage.set(SAVE_KEY, '{kaputt');
    nowSpy.mockReturnValue(777);
    expect(loadClock().seedFromSavedGame()).toBeNull();
    expect(loadClock().clock.now()).toBe(777);
  });

  it('liest den Spielstand unter demselben Schlüssel wie der Store', () => {
    expect(loadClock().SAVE_STORAGE_KEY).toBe(SAVE_KEY);
  });
});

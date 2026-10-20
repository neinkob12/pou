import { storage } from '../../lib/storage';
import {
  migrate,
  SAVE_BACKUP_KEY,
  SAVE_KEY,
  SAVE_VERSION,
  toSaveData,
  useGameStore,
  type GameStore,
} from '../gameStore';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const initial = useGameStore.getState();

function readSave(): { state: Record<string, unknown>; version: number } {
  const raw = storage.getString(SAVE_KEY);
  if (raw === undefined) throw new Error('kein Spielstand gespeichert');
  return JSON.parse(raw);
}

function writeSave(state: Record<string, unknown>, version: number) {
  storage.set(SAVE_KEY, JSON.stringify({ state, version }));
}

describe('Spielstand', () => {
  beforeEach(() => {
    useGameStore.setState(initial, true);
    storage.clearAll();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('ist nach dem Start geladen', () => {
    expect(useGameStore.getState().hydration).toBe('ready');
    expect(useGameStore.persist.hasHydrated()).toBe(true);
  });

  it('speichert jede Änderung mit Versionsnummer', () => {
    const s = useGameStore.getState();
    s.addCoins(42);
    s.plantSeed('gustav', T0);
    s.recordHarvest();
    const save = readSave();
    expect(save.version).toBe(SAVE_VERSION);
    expect(save.state.coins).toBe(42);
    expect(save.state.harvestsTotal).toBe(1);
    expect(save.state.plant).toEqual(useGameStore.getState().plant);
  });

  it('speichert keine Funktionen und keinen Hydration-Status', () => {
    useGameStore.getState().addCoins(1);
    const { state } = readSave();
    expect(state).not.toHaveProperty('addCoins');
    expect(state).not.toHaveProperty('hydration');
  });

  it('lädt einen gespeicherten Spielstand', async () => {
    useGameStore.getState().plantSeed('gustav', T0);
    const plant = useGameStore.getState().plant;
    // setState schreibt sofort; den Spielstand deshalb danach ablegen und neu laden.
    useGameStore.setState({ coins: 0, plant: null }, false);
    writeSave({ plant, coins: 7, turbo: true, harvestsTotal: 3 }, SAVE_VERSION);
    await useGameStore.persist.rehydrate();
    const s = useGameStore.getState();
    expect(s.coins).toBe(7);
    expect(s.turbo).toBe(true);
    expect(s.harvestsTotal).toBe(3);
    expect(s.plant).toEqual(plant);
    expect(typeof s.addCoins).toBe('function');
    expect(s.hydration).toBe('ready');
  });

  it('übersteht Speichern und Laden ohne Verlust', async () => {
    const s = useGameStore.getState();
    s.addCoins(5);
    s.plantSeed('gustav', T0);
    s.activateTurbo(T0 + 1000);
    const before = toSaveData(useGameStore.getState());
    useGameStore.setState(initial, true);
    storage.set(SAVE_KEY, JSON.stringify({ state: before, version: SAVE_VERSION }));
    await useGameStore.persist.rehydrate();
    expect(toSaveData(useGameStore.getState())).toEqual(before);
  });

  it('hebt einen Spielstand von Version 1 auf Version 2', async () => {
    writeSave({ plant: null, coins: 12, turbo: false }, 1);
    await useGameStore.persist.rehydrate();
    const s = useGameStore.getState();
    expect(s.coins).toBe(12);
    expect(s.harvestsTotal).toBe(0);
    // Der migrierte Stand wird sofort in neuer Version zurückgeschrieben.
    expect(readSave().version).toBe(SAVE_VERSION);
    expect(readSave().state.harvestsTotal).toBe(0);
  });

  it('übernimmt Startwerte für Felder, die im Spielstand fehlen', async () => {
    writeSave({ coins: 3 }, SAVE_VERSION);
    await useGameStore.persist.rehydrate();
    const s = useGameStore.getState();
    expect(s.coins).toBe(3);
    expect(s.turbo).toBe(false);
    expect(s.harvestsTotal).toBe(0);
  });

  it('sichert einen kaputten Spielstand und meldet failed', async () => {
    storage.set(SAVE_KEY, '{kaputt');
    await useGameStore.persist.rehydrate();
    expect(useGameStore.getState().hydration).toBe('failed');
    expect(storage.getString(SAVE_BACKUP_KEY)).toBe('{kaputt');
    expect(useGameStore.getState().coins).toBe(0);
  });
});

describe('migrate', () => {
  it('ergänzt bei Version 1 die Statistik und behält alle Werte', () => {
    const v1 = { plant: null, coins: 9, turbo: true, needs: { water: 0.5 } };
    expect(migrate(v1, 1)).toEqual({ ...v1, harvestsTotal: 0 });
  });

  it('verändert den alten Spielstand nicht', () => {
    const v1 = { plant: null, coins: 9, turbo: false };
    migrate(v1, 1);
    expect(v1).not.toHaveProperty('harvestsTotal');
  });

  it('lässt einen aktuellen Spielstand unverändert', () => {
    const v2 = { plant: null, coins: 1, turbo: false, harvestsTotal: 4 };
    expect(migrate(v2, SAVE_VERSION)).toEqual(v2);
  });

  it('liefert für unbrauchbare Daten ein leeres Objekt mit Startwerten der Migration', () => {
    expect(migrate(null, 1)).toEqual({ harvestsTotal: 0 });
  });
});

describe('toSaveData', () => {
  it('nimmt Werte fremder Slices automatisch mit', () => {
    // Simuliert einen späteren Slice (z. B. needs aus P04), der hier nicht bekannt ist.
    const state = {
      ...initial,
      needs: { water: 0.8, food: 0.4, updatedAtMs: T0 },
      unlockedStrains: ['gustav'],
      waterPlant: () => {},
    } as unknown as GameStore;
    const save = toSaveData(state) as Record<string, unknown>;
    expect(save.needs).toEqual({ water: 0.8, food: 0.4, updatedAtMs: T0 });
    expect(save.unlockedStrains).toEqual(['gustav']);
    expect(save).not.toHaveProperty('waterPlant');
  });
});

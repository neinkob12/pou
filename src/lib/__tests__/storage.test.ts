import { useGameStore } from '../../store/gameStore';
import { mmkvStateStorage, safeSet, storage } from '../storage';

const initial = useGameStore.getState();

/** Gerätespeicher voll: MMKV wirft beim Schreiben. */
function fillDisk() {
  return jest.spyOn(storage, 'set').mockImplementation(() => {
    throw new Error('No space left on device');
  });
}

describe('Speicher voll (P31)', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    useGameStore.setState(initial, true);
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('safeSet wirft nicht und meldet, ob geschrieben wurde', () => {
    expect(safeSet('p31-test', 'a')).toBe(true);
    expect(storage.getString('p31-test')).toBe('a');
    const full = fillDisk();
    expect(safeSet('p31-test', 'b')).toBe(false);
    expect(warn).toHaveBeenCalled();
    full.mockRestore();
    expect(storage.getString('p31-test')).toBe('a');
  });

  it('der Persist-Adapter wirft nicht', () => {
    fillDisk();
    expect(() => mmkvStateStorage.setItem('p31-test', 'x')).not.toThrow();
  });

  it('Spielaktionen laufen weiter, der Stand wird beim nächsten Schreiben nachgeholt', () => {
    const full = fillDisk();
    expect(() => useGameStore.getState().addCoins(25)).not.toThrow();
    expect(useGameStore.getState().coins).toBe(25);
    full.mockRestore();
    useGameStore.getState().addCoins(5);
    const saved = JSON.parse(storage.getString('potpou-save') ?? '{}') as { state?: { coins?: number } };
    expect(saved.state?.coins).toBe(30);
  });
});

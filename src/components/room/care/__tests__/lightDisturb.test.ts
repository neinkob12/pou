import { DARK_DISTURB_MOOD_PENALTY, NEED_START } from '../../../../game/config';
import { gameEvents } from '../../../../game/events';
import { createPlant, flipLight, getPlantStatus } from '../../../../game/timeEngine';
import { applyLightDisturbance } from '../../../../hooks/useNeeds';
import { useGameStore } from '../../../../store/gameStore';
import { isDarkDisturbPhase } from '../careLogic';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;
const initial = useGameStore.getState();

/** Pflanze in der Blüte zu `atMs`, Bedürfnisse frisch auf Startwerten. */
function setupFlowering(): number {
  const vegAt = T0 + 5 * DAY; // 50 Pflanzentage: Wachstum, umschaltbar
  const plant = flipLight(createPlant('gustav', T0, false), vegAt, 1);
  const at = vegAt + 60 * 1000;
  expect(getPlantStatus(plant, at, 1).phase).toBe('flowering');
  useGameStore.setState({ plant });
  useGameStore.getState().resetNeeds(at);
  return at;
}

describe('lightDisturbed: Laune-Abzug', () => {
  beforeEach(() => useGameStore.setState(initial, true));
  afterEach(() => gameEvents.clear());

  it('senkt die Laune in der Blüte genau einmal pro Ereignis', () => {
    const at = setupFlowering();
    gameEvents.on('lightDisturbed', ({ atMs }) => applyLightDisturbance(atMs));

    gameEvents.emit('lightDisturbed', { atMs: at });
    expect(useGameStore.getState().needs.values.mood).toBe(NEED_START.mood - DARK_DISTURB_MOOD_PENALTY);

    gameEvents.emit('lightDisturbed', { atMs: at });
    expect(useGameStore.getState().needs.values.mood).toBe(NEED_START.mood - 2 * DARK_DISTURB_MOOD_PENALTY);
  });

  it('außerhalb der Blüte passiert nichts', () => {
    useGameStore.setState({ plant: createPlant('gustav', T0, false) });
    useGameStore.getState().resetNeeds(T0);
    const before = useGameStore.getState().needs;
    expect(applyLightDisturbance(T0 + DAY)).toBe(false);
    expect(useGameStore.getState().needs).toBe(before);
  });

  it('ohne Pflanze passiert nichts', () => {
    expect(applyLightDisturbance(T0)).toBe(false);
  });

  it('nur Blüte und Erntereif haben eine geschützte Dunkelphase', () => {
    expect(isDarkDisturbPhase('flowering')).toBe(true);
    expect(isDarkDisturbPhase('ready')).toBe(true);
    expect(isDarkDisturbPhase('vegetative')).toBe(false);
    expect(isDarkDisturbPhase('drying')).toBe(false);
    expect(isDarkDisturbPhase(null)).toBe(false);
  });
});

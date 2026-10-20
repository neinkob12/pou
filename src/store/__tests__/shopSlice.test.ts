import { UPGRADES } from '../../game/config';
import { gameEvents } from '../../game/events';
import { useGameStore } from '../gameStore';
import { selectUpgradeEffects } from '../slices/shop';

const T0 = Date.UTC(2026, 9, 1, 12, 0, 0);
const initial = useGameStore.getState();

describe('shop-Slice', () => {
  beforeEach(() => useGameStore.setState(initial, true));
  afterEach(() => gameEvents.clear());

  it('kauft mit Münzen, zieht den Preis ab und meldet den Kauf', () => {
    const listener = jest.fn();
    gameEvents.on('purchaseCompleted', listener);
    const price = UPGRADES.pot[0].price;
    useGameStore.getState().addCoins(price + 5);

    const { buyUpgrade, spendCoins } = useGameStore.getState();
    expect(buyUpgrade('pot', spendCoins, T0)).toBe(true);

    const state = useGameStore.getState();
    expect(state.coins).toBe(5);
    expect(state.upgrades.pot).toBe(1);
    expect(selectUpgradeEffects(state).needModifiers.water).toBe(UPGRADES.pot[0].effect.needDecay?.water);
    expect(listener).toHaveBeenCalledWith({ productId: 'upgrade:pot:1', atMs: T0 });
  });

  it('Doppel-Tap (P31): zweiter Tipp mit der alten Stufe kauft nicht die übernächste Stufe', () => {
    useGameStore.setState({ coins: 10000 });
    const { buyUpgrade, spendCoins } = useGameStore.getState();
    expect(buyUpgrade('pot', spendCoins, T0, 0)).toBe(true);
    expect(buyUpgrade('pot', spendCoins, T0, 0)).toBe(false);
    const state = useGameStore.getState();
    expect(state.upgrades.pot).toBe(1);
    expect(state.coins).toBe(10000 - UPGRADES.pot[0].price);
    expect(buyUpgrade('pot', spendCoins, T0, 1)).toBe(true);
    expect(useGameStore.getState().upgrades.pot).toBe(2);
  });

  it('ohne genug Münzen passiert nichts', () => {
    const listener = jest.fn();
    gameEvents.on('purchaseCompleted', listener);
    const { buyUpgrade, spendCoins } = useGameStore.getState();
    expect(buyUpgrade('led', spendCoins, T0)).toBe(false);
    expect(useGameStore.getState().upgrades.led).toBe(0);
    expect(listener).not.toHaveBeenCalled();
  });

  it('volle Upgrades kosten nichts mehr', () => {
    useGameStore.setState({ upgrades: { ...initial.upgrades, beneficials: 1 }, coins: 1000 });
    const pay = jest.fn(() => true);
    expect(useGameStore.getState().buyUpgrade('beneficials', pay, T0)).toBe(false);
    expect(pay).not.toHaveBeenCalled();
  });
});
